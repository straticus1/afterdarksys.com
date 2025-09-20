const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');
const AEIMSClient = require('./lib/aeims-client');

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize AEIMS client
const aeimsClient = new AEIMSClient(
  process.env.AEIMS_URL || 'http://localhost:3000',
  process.env.AEIMS_API_KEY
);

app.use(helmet({
  contentSecurityPolicy: false 
}));
app.use(cors({
  origin: ['https://afterdarksys.com', 'https://login.afterdarksys.com'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

const PLATFORMS = [
  { name: 'AEIMS', domain: 'aeims.com', category: 'Adult Entertainment', status: 'active', revenue: 'high' },
  { name: 'Undateable.me', domain: 'undateable.me', category: 'Dating Safety', status: 'active', revenue: 'medium' },
  { name: 'OutOfWork.life', domain: 'outofwork.life', category: 'Job Search', status: 'active', revenue: 'medium' },
  { name: 'PoliticalMemes.xyz', domain: 'politicalmemes.xyz', category: 'Political AI', status: 'active', revenue: 'high' },
  { name: '9Lives.xyz', domain: '9lives.xyz', category: 'Crypto Risk', status: 'active', revenue: 'high' },
  { name: 'NerdyCupid.com', domain: 'nerdycupid.com', category: 'Scientific Dating', status: 'active', revenue: 'medium' },
  { name: 'VeriBits.com', domain: 'veribits.com', category: 'Trust Verification', status: 'active', revenue: 'medium' },
  { name: 'SmokeOut.NYC', domain: 'smokeout.nyc', category: 'Cannabis Gaming', status: 'active', revenue: 'high' }
];

const ECOSYSTEM_SERVICES = [
  { name: 'Login Service', url: 'https://login.afterdarksys.com', status: 'online' },
  { name: 'API Gateway', url: 'https://api.afterdarksys.com', status: 'online' },
  { name: 'Billing Hub', url: 'https://billing.afterdarksys.com', status: 'online' },
  { name: 'Analytics', url: 'https://analytics.afterdarksys.com', status: 'online' },
  { name: 'Documentation', url: 'https://docs.afterdarksys.com', status: 'online' },
  { name: 'Status Monitor', url: 'https://status.afterdarksys.com', status: 'online' }
];

let systemMetrics = {
  totalPlatforms: PLATFORMS.length,
  activePlatforms: PLATFORMS.filter(p => p.status === 'active').length,
  totalUsers: 127543,
  apiRequests: 2847291,
  revenue: {
    daily: 45672,
    monthly: 1389502,
    yearly: 16674024
  },
  valuation: {
    conservative: 50000000,
    growth: 100000000,
    strategic: 300000000
  }
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'afterdark-admin-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'admin-portal',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({
    platforms: PLATFORMS,
    services: ECOSYSTEM_SERVICES,
    metrics: systemMetrics,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/platforms', authenticateToken, (req, res) => {
  res.json({
    platforms: PLATFORMS,
    summary: {
      total: PLATFORMS.length,
      active: PLATFORMS.filter(p => p.status === 'active').length,
      highRevenue: PLATFORMS.filter(p => p.revenue === 'high').length,
      mediumRevenue: PLATFORMS.filter(p => p.revenue === 'medium').length
    }
  });
});

app.get('/api/services', authenticateToken, (req, res) => {
  res.json({
    services: ECOSYSTEM_SERVICES,
    health: ECOSYSTEM_SERVICES.every(s => s.status === 'online') ? 'healthy' : 'degraded'
  });
});

app.get('/api/metrics', authenticateToken, (req, res) => {
  res.json({
    ...systemMetrics,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/platform/:domain/action', authenticateToken, (req, res) => {
  const { domain } = req.params;
  const { action } = req.body;
  
  const platform = PLATFORMS.find(p => p.domain === domain);
  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  console.log(`Admin action: ${action} on platform ${domain} by user ${req.user.username}`);
  
  res.json({
    success: true,
    message: `Action '${action}' executed on ${platform.name}`,
    platform: platform.name,
    action,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/logs', authenticateToken, (req, res) => {
  const mockLogs = [
    { timestamp: new Date().toISOString(), level: 'INFO', service: 'API Gateway', message: 'Rate limit threshold reached for client xyz' },
    { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'SUCCESS', service: 'Login Service', message: 'User authentication successful' },
    { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'INFO', service: 'Analytics', message: 'Daily report generated' },
    { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'WARNING', service: 'Billing', message: 'Payment retry scheduled for failed transaction' }
  ];
  
  res.json({ logs: mockLogs });
});

app.get('/api/revenue', authenticateToken, (req, res) => {
  const revenueBreakdown = {
    byPlatform: [
      { platform: 'AEIMS', revenue: 5234567, percentage: 31.4 },
      { platform: 'PoliticalMemes.xyz', revenue: 3456789, percentage: 20.7 },
      { platform: '9Lives.xyz', revenue: 2987654, percentage: 17.9 },
      { platform: 'SmokeOut.NYC', revenue: 2345678, percentage: 14.1 },
      { platform: 'API Gateway', revenue: 1567890, percentage: 9.4 },
      { platform: 'Others', revenue: 1081446, percentage: 6.5 }
    ],
    byService: [
      { service: 'Platform Operations', revenue: 12456789, percentage: 74.7 },
      { service: 'API Gateway', revenue: 2987654, percentage: 17.9 },
      { service: 'Enterprise Services', revenue: 1229581, percentage: 7.4 }
    ],
    total: systemMetrics.revenue.yearly,
    growth: {
      daily: '+2.3%',
      weekly: '+8.7%',
      monthly: '+15.2%',
      yearly: '+127.4%'
    }
  };
  
  res.json(revenueBreakdown);
});

app.get('/api/aeims/domains', authenticateToken, async (req, res) => {
  try {
    const domains = await aeimsClient.getDomains();
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

cron.schedule('*/30 * * * * *', () => {
  systemMetrics.totalUsers += Math.floor(Math.random() * 10);
  systemMetrics.apiRequests += Math.floor(Math.random() * 100);
  systemMetrics.revenue.daily += Math.floor(Math.random() * 1000);
});

const server = app.listen(PORT, () => {
  console.log(`🌙 After Dark Systems Admin Portal running on port ${PORT}`);
  console.log(`👑 Master Control Panel: Ready`);
  console.log(`📊 Managing ${PLATFORMS.length} entertainment platforms`);
  console.log(`💰 Tracking $${systemMetrics.valuation.strategic.toLocaleString()} strategic value`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Admin dashboard connected');
  
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'metrics_update',
      data: systemMetrics,
      timestamp: new Date().toISOString()
    }));
  }, 10000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Admin dashboard disconnected');
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});