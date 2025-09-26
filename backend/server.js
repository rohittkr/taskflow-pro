const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'TaskFlow Pro API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected'
  });
});

// Import and use route files
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️  Auth routes not found:', error.message);
}

try {
  const projectRoutes = require('./routes/projects');
  app.use('/api/projects', projectRoutes);
  console.log('✅ Project routes loaded');
} catch (error) {
  console.log('⚠️  Project routes not found');
}

try {
  const taskRoutes = require('./routes/tasks');
  app.use('/api/tasks', taskRoutes);
  console.log('✅ Task routes loaded');
} catch (error) {
  console.log('⚠️  Task routes not found');
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
} catch (error) {
  console.log('⚠️  User routes not found');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint not found' 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('=================================');
  
  // Test database connection and create tables
  console.log('🔄 Testing database connection...');
  const dbConnected = await testConnection();
  if (dbConnected) {
    await initializeDatabase();
    console.log('=================================');
    console.log('🎉 TaskFlow Pro Backend Ready!');
    console.log('📋 Available Endpoints:');
    console.log('   POST /api/auth/register - Register user');
    console.log('   POST /api/auth/login - Login user');
    console.log('   GET /api/auth/profile - Get user profile');
    console.log('   POST /api/auth/logout - Logout user');
    console.log('=================================');
  } else {
    console.log('❌ Server started but database connection failed');
    console.log('💡 Check your .env file and MySQL connection');
  }
});