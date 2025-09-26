const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        success: false 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const users = await executeQuery(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found',
        success: false 
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        message: 'Account is deactivated',
        success: false 
      });
    }

    // Add user info to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        success: false 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        success: false 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      success: false 
    });
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        success: false 
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        success: false,
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user owns resource or has admin role
const requireOwnershipOrAdmin = (getUserIdFromParams) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        success: false 
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Get user ID from the resource
    const resourceUserId = getUserIdFromParams(req);
    
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        message: 'Access denied - you can only access your own resources',
        success: false 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin
};