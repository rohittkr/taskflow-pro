const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

// Test route (keep for testing)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /register': 'Register new user',
      'POST /login': 'Login user',  
      'GET /profile': 'Get user profile (protected)',
      'POST /logout': 'Logout user (protected)'
    }
  });
});

module.exports = router;