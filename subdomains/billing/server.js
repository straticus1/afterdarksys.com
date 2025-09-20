const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet({
  contentSecurityPolicy: false 
}));
app.use(cors({
  origin: ['https://afterdarksys.com', 'https://admin.afterdarksys.com'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many billing requests from this IP' }
});

app.use('/api/', billingLimiter);

const SUBSCRIPTION_TIERS = {
  api_starter: {
    name: 'API Starter',
    price: 99,
    requests: 10000,
    features: ['Basic API Access', 'Email Support', 'Standard Rate Limits']
  },
  api_professional: {
    name: 'API Professional',
    price: 499,
    requests: 100000,
    features: ['Full API Access', 'Priority Support', 'Higher Rate Limits', 'Analytics Dashboard']
  },
  api_enterprise: {
    name: 'API Enterprise',
    price: 2499,
    requests: 1000000,
    features: ['Unlimited API Access', '24/7 Support', 'Custom Rate Limits', 'Dedicated Account Manager', 'SLA Guarantee']
  },
  platform_integration: {
    name: 'Platform Integration',
    price: 9999,
    requests: 'unlimited',
    features: ['Full Platform Suite', 'White-label Options', 'Custom Development', 'Dedicated Infrastructure']
  }
};

const mockTransactions = [
  {
    id: 'txn_001',
    customer: 'ACME Entertainment Corp',
    amount: 2499,
    service: 'API Enterprise',
    status: 'completed',
    date: moment().subtract(1, 'days').toISOString(),
    platform: 'PoliticalMemes.xyz'
  },
  {
    id: 'txn_002',
    customer: 'Digital Ventures LLC',
    amount: 499,
    service: 'API Professional',
    status: 'completed',
    date: moment().subtract(3, 'days').toISOString(),
    platform: 'Undateable.me'
  },
  {
    id: 'txn_003',
    customer: 'Tech Startup Inc',
    amount: 99,
    service: 'API Starter',
    status: 'pending',
    date: moment().subtract(2, 'hours').toISOString(),
    platform: 'NerdyCupid.com'
  },
  {
    id: 'txn_004',
    customer: 'Enterprise Solutions Co',
    amount: 9999,
    service: 'Platform Integration',
    status: 'completed',
    date: moment().subtract(7, 'days').toISOString(),
    platform: 'AEIMS'
  },
  {
    id: 'txn_005',
    customer: 'Gaming Network Ltd',
    amount: 2499,
    service: 'API Enterprise',
    status: 'failed',
    date: moment().subtract(1, 'hour').toISOString(),
    platform: 'SmokeOut.NYC'
  }
];

let revenueMetrics = {
  daily: 45672,
  weekly: 189432,
  monthly: 1389502,
  yearly: 16674024,
  mrr: 1389502,
  arr: 16674024,
  growth: {
    daily: 2.3,
    weekly: 8.7,
    monthly: 15.2,
    yearly: 127.4
  }
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'afterdark-billing-secret', (err, user) => {
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
    service: 'billing-hub',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  const totalRevenue = mockTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingRevenue = mockTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    revenue: revenueMetrics,
    transactions: {
      total: mockTransactions.length,
      completed: mockTransactions.filter(t => t.status === 'completed').length,
      pending: mockTransactions.filter(t => t.status === 'pending').length,
      failed: mockTransactions.filter(t => t.status === 'failed').length,
      totalAmount: totalRevenue,
      pendingAmount: pendingRevenue
    },
    subscriptions: SUBSCRIPTION_TIERS,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/transactions', authenticateToken, (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  let filteredTransactions = mockTransactions;
  if (status) {
    filteredTransactions = mockTransactions.filter(t => t.status === status);
  }
  
  const paginatedTransactions = filteredTransactions
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
  res.json({
    transactions: paginatedTransactions,
    total: filteredTransactions.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

app.get('/api/revenue', authenticateToken, (req, res) => {
  const { period = 'monthly' } = req.query;
  
  const revenueByPlatform = {
    'AEIMS': 5234567,
    'PoliticalMemes.xyz': 3456789,
    '9Lives.xyz': 2987654,
    'SmokeOut.NYC': 2345678,
    'API Gateway': 1567890,
    'Others': 1081446
  };
  
  const revenueByTier = {
    'Platform Integration': 9999000,
    'API Enterprise': 4998000,
    'API Professional': 1497000,
    'API Starter': 297000
  };
  
  res.json({
    metrics: revenueMetrics,
    byPlatform: revenueByPlatform,
    byTier: revenueByTier,
    period,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/subscriptions', authenticateToken, (req, res) => {
  res.json({
    tiers: SUBSCRIPTION_TIERS,
    totalSubscribers: 1247,
    tierDistribution: {
      api_starter: 856,
      api_professional: 312,
      api_enterprise: 67,
      platform_integration: 12
    }
  });
});

app.post('/api/subscription', authenticateToken, (req, res) => {
  const { tier, customer, platform } = req.body;
  
  if (!SUBSCRIPTION_TIERS[tier]) {
    return res.status(400).json({ error: 'Invalid subscription tier' });
  }
  
  const subscription = {
    id: uuidv4(),
    tier,
    customer,
    platform,
    amount: SUBSCRIPTION_TIERS[tier].price,
    status: 'active',
    createdAt: new Date().toISOString(),
    nextBilling: moment().add(1, 'month').toISOString()
  };
  
  res.json({
    success: true,
    subscription,
    message: `Subscription created for ${customer} - ${SUBSCRIPTION_TIERS[tier].name}`
  });
});

app.post('/api/payment', authenticateToken, (req, res) => {
  const { amount, customer, service, platform } = req.body;
  
  const payment = {
    id: `txn_${Date.now()}`,
    customer,
    amount,
    service,
    platform,
    status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
    date: new Date().toISOString(),
    paymentMethod: 'stripe'
  };
  
  // Simulate adding to transactions
  mockTransactions.unshift(payment);
  
  if (payment.status === 'completed') {
    revenueMetrics.daily += amount;
    revenueMetrics.monthly += amount;
    revenueMetrics.yearly += amount;
  }
  
  res.json({
    success: payment.status === 'completed',
    payment,
    message: payment.status === 'completed' ? 
      'Payment processed successfully' : 
      'Payment failed - please retry'
  });
});

app.get('/api/analytics', authenticateToken, (req, res) => {
  const { period = '30d' } = req.query;
  
  // Generate mock analytics data
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const dailyData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = moment().subtract(i, 'days');
    const baseAmount = 45000 + (Math.random() * 20000);
    
    dailyData.push({
      date: date.format('YYYY-MM-DD'),
      revenue: Math.floor(baseAmount),
      transactions: Math.floor(Math.random() * 50) + 20,
      newCustomers: Math.floor(Math.random() * 10) + 2
    });
  }
  
  res.json({
    period,
    data: dailyData,
    summary: {
      totalRevenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
      totalTransactions: dailyData.reduce((sum, d) => sum + d.transactions, 0),
      averageTransactionValue: dailyData.reduce((sum, d) => sum + d.revenue, 0) / dailyData.reduce((sum, d) => sum + d.transactions, 0),
      newCustomers: dailyData.reduce((sum, d) => sum + d.newCustomers, 0)
    }
  });
});

app.get('/api/customers', authenticateToken, (req, res) => {
  const customers = [
    { id: 'cust_001', name: 'ACME Entertainment Corp', tier: 'api_enterprise', monthlySpend: 2499, platforms: ['PoliticalMemes.xyz', 'AEIMS'] },
    { id: 'cust_002', name: 'Digital Ventures LLC', tier: 'api_professional', monthlySpend: 499, platforms: ['Undateable.me'] },
    { id: 'cust_003', name: 'Tech Startup Inc', tier: 'api_starter', monthlySpend: 99, platforms: ['NerdyCupid.com'] },
    { id: 'cust_004', name: 'Enterprise Solutions Co', tier: 'platform_integration', monthlySpend: 9999, platforms: ['AEIMS', 'SmokeOut.NYC', '9Lives.xyz'] },
    { id: 'cust_005', name: 'Gaming Network Ltd', tier: 'api_enterprise', monthlySpend: 2499, platforms: ['SmokeOut.NYC'] }
  ];
  
  res.json({ customers });
});

app.listen(PORT, () => {
  console.log(`💳 After Dark Systems Billing Hub running on port ${PORT}`);
  console.log(`💰 Payment Processing: Ready`);
  console.log(`📊 Tracking $${revenueMetrics.yearly.toLocaleString()} annual revenue`);
  console.log(`🎯 ${Object.keys(SUBSCRIPTION_TIERS).length} subscription tiers available`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});