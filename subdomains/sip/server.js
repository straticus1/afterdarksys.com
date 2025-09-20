const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const AEIMSClient = require('./src/aeims-client');
const authRoutes = require('./src/routes/auth');
const sipRoutes = require('./src/routes/sip');
const callRoutes = require('./src/routes/calls');
const webhookRoutes = require('./src/routes/webhooks');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "https://afterdarksys.com"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3005;
const AEIMS_BASE_URL = process.env.AEIMS_BASE_URL || 'http://localhost:8080';

// Initialize AEIMS client
const aeimsClient = new AEIMSClient(AEIMS_BASE_URL);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make AEIMS client available to routes
app.use((req, res, next) => {
  req.aeimsClient = aeimsClient;
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sip', sipRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const aeimsHealth = await aeimsClient.healthCheck();
    res.json({
      status: 'healthy',
      service: 'sip-gateway',
      timestamp: new Date().toISOString(),
      aeims: aeimsHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'sip-gateway',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    });
  }
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('subscribe-call-events', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} subscribed to call events`);
  });
  
  socket.on('unsubscribe-call-events', (userId) => {
    socket.leave(`user-${userId}`);
    console.log(`User ${userId} unsubscribed from call events`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🌙 After Dark Systems SIP Gateway running on port ${PORT}`);
  console.log(`📞 AEIMS Integration: ${AEIMS_BASE_URL}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test AEIMS connection
  aeimsClient.healthCheck()
    .then(() => console.log('✅ AEIMS connection established'))
    .catch(err => console.error('❌ AEIMS connection failed:', err.message));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };