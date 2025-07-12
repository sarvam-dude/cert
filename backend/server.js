require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const certificateRoutes = require('./routes/certificates');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 12001;

// Connect to MongoDB with error handling
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:12000',
    'https://work-1-qpkodnrhqdzavzod.prod-runtime.all-hands.dev',
    'https://work-2-qpkodnrhqdzavzod.prod-runtime.all-hands.dev',
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/work-\d+-qpkodnrhqdzavzod\.prod-runtime\.all-hands\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Certificate Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      upload: 'enabled',
      qrGeneration: 'enabled',
      emailService: 'enabled',
      fileTypes: ['pdf', 'png', 'jpg', 'jpeg']
    }
  });
});

// API routes
app.use('/api', certificateRoutes);

// Serve uploaded files statically (for development)
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Certificate Management API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST /api/upload - Upload certificate`);
  console.log(`   GET  /api/certificate/:id - Download certificate`);
  console.log(`   GET  /api/certificate/:id/info - Get certificate info`);
  console.log(`   GET  /api/certificate/:id/qr - Generate QR code`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📁 Static files: http://localhost:${PORT}/uploads`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;