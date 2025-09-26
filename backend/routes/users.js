const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Users routes working!',
    timestamp: new Date().toISOString()
  });
});

// TODO: Get user profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - coming soon!' });
});

// TODO: Update user profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - coming soon!' });
});

// TODO: Get all users (admin only)
router.get('/', (req, res) => {
  res.json({ message: 'Get all users - coming soon!' });
});

module.exports = router;