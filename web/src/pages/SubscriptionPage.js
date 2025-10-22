import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getSubscriptionPlans,
  createSubscriptionOrder,
  verifyPayment,
  getCurrentSubscription,
  selectPlans,
  selectCurrentSubscription,
  selectSubscriptionLoading,
  selectPaymentLoading,
  selectSubscriptionError,
} from '../store/slices/subscriptionSlice';
import { updateUserSubscription } from '../store/slices/authSlice';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const dispatch = useDispatch();
  
  const plans = useSelector(selectPlans);
  const currentSubscription = useSelector(selectCurrentSubscription);
  const isLoading = useSelector(selectSubscriptionLoading);
  const paymentLoading = useSelector(selectPaymentLoading);
  const error = useSelector(selectSubscriptionError);

  useEffect(() => {
    dispatch(getSubscriptionPlans());
    dispatch(getCurrentSubscription());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubscribe = async () => {
    try {
      // Create order
      const orderResult = await dispatch(createSubscriptionOrder(selectedPlan));
      
      if (orderResult.type === 'subscription/createOrder/fulfilled') {
        const { orderId, amount } = orderResult.payload;
        
        // Initialize Razorpay
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Openbaux',
          description: `Black Tick Verification - ${selectedPlan}`,
          order_id: orderId,
          image: '/logo192.png', // Add your logo
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResult = await dispatch(verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }));

              if (verifyResult.type === 'subscription/verifyPayment/fulfilled') {
                // Update user in auth slice
                dispatch(updateUserSubscription({
                  isVerified: true,
                  subscriptionType: selectedPlan,
                  blackTickExpiry: verifyResult.payload.subscription.endDate,
                }));

                toast.success('🎉 Congratulations! You now have the Black Tick!');
              }
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
            contact: '9999999999'
          },
          notes: {
            plan: selectedPlan,
            platform: 'web'
          },
          theme: {
            color: '#3b82f6'
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentSubscription?.hasSubscription && currentSubscription?.isActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 text-white text-center"
        >
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">You're Verified!</h1>
          <p className="text-gray-300 mb-6">
            You have an active Black Tick subscription
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="text-lg font-semibold">
              {currentSubscription.subscription?.plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
            </div>
            <div className="text-sm text-gray-300">
              {currentSubscription.daysLeft} days remaining
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-300">Verified Badge</div>
              <div className="font-semibold">Active</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-300">Ad-free</div>
              <div className="font-semibold">Active</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-300">Priority Support</div>
              <div className="font-semibold">Active</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-300">Analytics</div>
              <div className="font-semibold">Active</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">✓</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get Black Tick Verified
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join the exclusive verified community on Openbaux. Stand out with the prestigious Black Tick badge and unlock premium features.
        </p>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div 
        className="grid md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Monthly Plan */}
        <div 
          className={`relative bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer ${
            selectedPlan === 'monthly' 
              ? 'border-blue-500 shadow-blue-500/20 shadow-xl' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('monthly')}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Monthly</h3>
            <div className={`w-6 h-6 rounded-full border-2 ${
              selectedPlan === 'monthly' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedPlan === 'monthly' && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">₹99</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            <p className="text-gray-500 mt-2">Perfect for trying out verification</p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Exclusive Black Tick badge</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Ad-free experience</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Priority customer support</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Advanced analytics</span>
            </li>
          </ul>
        </div>

        {/* Yearly Plan */}
        <div 
          className={`relative bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer ${
            selectedPlan === 'yearly' 
              ? 'border-blue-500 shadow-blue-500/20 shadow-xl' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          {/* Best Value Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              BEST VALUE - Save ₹189
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Yearly</h3>
            <div className={`w-6 h-6 rounded-full border-2 ${
              selectedPlan === 'yearly' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedPlan === 'yearly' && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">₹999</span>
              <span className="text-gray-600 ml-2">/year</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-gray-400 line-through">₹1,188</span>
              <span className="text-green-600 font-semibold">Save ₹189</span>
            </div>
            <p className="text-gray-500 mt-1">2 months absolutely free!</p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Exclusive Black Tick badge</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Ad-free experience</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Priority customer support</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Advanced analytics</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">★</span>
              </div>
              <span className="text-gray-700 font-semibold">2 months FREE bonus</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Subscribe Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleSubscribe}
          disabled={paymentLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {paymentLoading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <>
              Get Black Tick - ₹{selectedPlan === 'monthly' ? '99/month' : '999/year'}
            </>
          )}
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          Secure payment powered by Razorpay • Cancel anytime
        </p>
      </motion.div>

      {/* Features Showcase */}
      <motion.div 
        className="mt-16 grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Exclusive Badge</h3>
          <p className="text-gray-600">Stand out with the prestigious Black Tick verification badge</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Priority Support</h3>
          <p className="text-gray-600">Get faster response times and dedicated customer support</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600">Access detailed insights about your content performance</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPage;