const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Upload single file
router.post('/single', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: isVideo ? 'video' : 'image',
      folder: isVideo ? 'social_media/videos' : 'social_media/images',
      quality: 'auto',
      fetch_format: 'auto'
    };

    if (isVideo) {
      uploadOptions.video_codec = 'h264';
      uploadOptions.audio_codec = 'aac';
    }

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      type: isVideo ? 'video' : 'image',
      duration: result.duration || null,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload multiple files
router.post('/multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video/');
      
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadOptions = {
        resource_type: isVideo ? 'video' : 'image',
        folder: isVideo ? 'social_media/videos' : 'social_media/images',
        quality: 'auto',
        fetch_format: 'auto'
      };

      if (isVideo) {
        uploadOptions.video_codec = 'h264';
        uploadOptions.audio_codec = 'aac';
      }

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
        duration: result.duration || null,
        width: result.width,
        height: result.height
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete file from Cloudinary
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { type } = req.query; // 'image' or 'video'

    await cloudinary.uploader.destroy(publicId, {
      resource_type: type === 'video' ? 'video' : 'image'
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

module.exports = router;