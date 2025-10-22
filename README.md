# 📱 Openbaux - The Social Media Platform

A full-featured social media application with photo/video sharing, stories, reels, and **Black Tick verification subscription** at ₹99/month or ₹999/year.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Profile management

### 📝 Posts
- Photo and video uploads
- Captions and tags
- Like and comment system
- Feed with posts from followed users

### 📖 Stories
- 24-hour temporary stories
- Photo and video stories
- Story views tracking
- Real-time story feed

### 🎬 Reels
- Short-form video content
- Discovery feed with recommendations
- Like, comment, and share
- Video view tracking

### 🔄 Real-time Features
- Live notifications
- Real-time likes and comments
- Socket.io integration

### 💎 Black Tick Subscription
- **Monthly**: ₹99/month for verified badge
- **Yearly**: ₹999/year (2 months FREE!)
- Exclusive black tick verification
- Ad-free experience
- Priority support
- Advanced analytics

### 🎨 Modern UI/UX
- React Native with Expo
- Beautiful, responsive design
- Smooth animations
- Instagram-inspired interface

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with Mongoose
- **Socket.io** for real-time features
- **Cloudinary** for media storage
- **JWT** for authentication
- **Bcrypt** for password hashing

### Mobile App
- **React Native** with Expo
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **Expo Camera** for photo/video capture
- **Expo Media Library** for gallery access

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- Expo CLI
- Android Studio (for Android development)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd social-media-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm run install-all

# Or manually:
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Setup
```bash
# Copy environment file
cp server/.env.example server/.env

# Edit server/.env with your values:
# - MongoDB connection string
# - JWT secret
# - Cloudinary credentials
```

### 4. Start Development
```bash
# Start both server and client
npm run dev

# Or start individually:
npm run server  # Backend on port 5000
npm run client  # React Native on Expo
```

### 5. Mobile Development
```bash
cd client
expo start

# Then:
# - Press 'a' for Android
# - Press 'i' for iOS
# - Scan QR code with Expo Go app
```

## 📁 Project Structure

```
social-media-app/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & validation
│   └── index.js          # Server entry point
├── client/                # React Native app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── components/   # Reusable components
│   │   ├── store/        # Redux store
│   │   └── hooks/        # Custom hooks
│   ├── App.js           # App entry point
│   ├── app.json         # Expo configuration
│   └── eas.json         # Build configuration
├── package.json         # Root package.json
└── README.md           # This file
```

## 🛠️ Development

### API Endpoints

#### Authentication
```
POST /api/auth/signup    # Register new user
POST /api/auth/login     # User login
GET  /api/auth/me        # Get current user
GET  /api/auth/verify    # Verify token
```

#### Posts
```
POST /api/posts          # Create post
GET  /api/posts/feed     # Get feed
GET  /api/posts/:id      # Get single post
POST /api/posts/:id/like # Like/unlike post
POST /api/posts/:id/comment # Add comment
```

#### Stories
```
POST /api/stories        # Create story
GET  /api/stories/feed   # Get stories feed
POST /api/stories/:id/view # Mark as viewed
```

#### Reels
```
POST /api/reels          # Create reel
GET  /api/reels/feed     # Get reels feed
POST /api/reels/:id/like # Like/unlike reel
```

#### Upload
```
POST /api/upload/single   # Upload single file
POST /api/upload/multiple # Upload multiple files
```

### Database Models

#### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  fullName: String,
  bio: String,
  profilePicture: String,
  followers: [ObjectId],
  following: [ObjectId],
  // ... more fields
}
```

#### Post Schema
```javascript
{
  user: ObjectId,
  caption: String,
  media: [{
    type: String, // 'image' or 'video'
    url: String,
    publicId: String
  }],
  likes: [{ user: ObjectId, createdAt: Date }],
  comments: [{ user: ObjectId, text: String, createdAt: Date }],
  // ... more fields
}
```

## 📱 Mobile App Features

### Screen Components
- **AuthScreen**: Login/Signup forms
- **HomeScreen**: Feed with posts and stories
- **SearchScreen**: User and content search
- **CameraScreen**: Photo/video capture
- **ReelsScreen**: Short video feed
- **ProfileScreen**: User profile display

### Key Libraries
```json
{
  "expo-camera": "Camera access",
  "expo-media-library": "Gallery access", 
  "expo-av": "Video playback",
  "@react-navigation/native": "Navigation",
  "@reduxjs/toolkit": "State management",
  "react-native-vector-icons": "Icons"
}
```

## 🔧 Configuration

### MongoDB Setup
```bash
# Local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Cloudinary Setup
1. Create account at cloudinary.com
2. Get API credentials
3. Update `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📦 Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### Mobile App Deployment (Play Store)
```bash
# Build production app
eas build --platform android --profile production

# Submit to store
eas submit --platform android
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Mobile Testing
```bash
cd client
expo start
# Test on multiple devices and screen sizes
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@socialmediaapp.com

## 📊 Revenue Model

### 💰 Subscription Revenue
- **₹99/month** × users = Monthly revenue
- **₹999/year** × users = Yearly revenue
- **Example**: 1,000 users = ₹99,000/month potential

### 📈 Growth Projections
- **Month 1-3**: 0-500 users (₹0-49,500/month)
- **Month 4-6**: 500-2,000 users (₹49,500-198,000/month)
- **Month 7-12**: 2,000-10,000 users (₹198,000-990,000/month)

## 🔮 Roadmap

### Version 1.1 - Revenue Features
- [ ] Affiliate program
- [ ] Brand partnerships
- [ ] Premium content
- [ ] Sponsored posts

### Version 1.2 - Advanced Features
- [ ] Direct messaging
- [ ] Live streaming
- [ ] Group posts
- [ ] Events system

## 🏆 Credits

Built with ❤️ using modern web and mobile technologies.

---

**Ready to launch Openbaux and start earning with Black Tick subscriptions? Let's go! 🚀💰**

---

## 🎯 **Status Update**: 
✅ **Backend Complete** (100%)  
🔧 **Web App in Progress** (Building this week)  
📱 **Mobile App** (Next phase)  
💰 **Revenue Ready** (₹99/₹999 subscriptions)