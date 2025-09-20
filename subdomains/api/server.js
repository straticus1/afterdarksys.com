/**
 * After Dark Systems - Unified API Gateway
 * The Revenue Engine: Monetizing data from 15+ entertainment platforms
 * 
 * Projected Annual Revenue: $500K - $5M+
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: [
        /\.afterdarksys\.com$/,
        'http://localhost:8080',
        'https://afterdarksys.com'
    ],
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// API Rate Limiting (Tiered)
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false
});

// Free Tier: 100 requests/hour
const freeTierLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    100,
    'Free tier limit exceeded. Upgrade for more requests.'
);

// Pro Tier: 1000 requests/hour  
const proTierLimit = createRateLimit(
    60 * 60 * 1000,
    1000,
    'Pro tier limit exceeded. Contact sales for enterprise.'
);

// Enterprise: 10000 requests/hour
const enterpriseLimit = createRateLimit(
    60 * 60 * 1000,
    10000,
    'Enterprise limit exceeded. Contact support.'
);

// API Configuration
const API_PRICING = {
    dating_safety: { price: 0.50, description: 'Dating safety lookup from Undateable.me' },
    political_sentiment: { price: 0.25, description: 'Political sentiment from PoliticalMemes.xyz' },
    crypto_risk: { price: 1.00, description: 'Crypto risk assessment from 9Lives.xyz' },
    trust_verification: { price: 0.75, description: 'Trust verification from VeriBits.com' },
    job_market: { price: 0.30, description: 'Job market data from OutOfWork.life' },
    cannabis_data: { price: 0.40, description: 'Cannabis market data from SmokeoutNYC' },
    dating_match: { price: 0.20, description: 'Scientific matching from NerdyCupid.com' },
    authentication: { price: 0.01, description: 'Authentication as a service' },
    sms_communication: { price: 0.05, description: 'SMS/Communication via NiteText' }
};

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'After Dark Systems API Gateway',
            version: '1.0.0',
            description: 'Unified API access to 15+ entertainment platforms',
            contact: {
                name: 'After Dark Systems',
                url: 'https://afterdarksys.com',
                email: 'api@afterdarksys.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3002',
                description: 'Development server'
            },
            {
                url: 'https://api.afterdarksys.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            }
        },
        security: [
            { bearerAuth: [] },
            { apiKeyAuth: [] }
        ]
    },
    apis: ['./server.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Mock API Keys & Usage Tracking (replace with database)
const apiKeys = new Map([
    ['demo_key_12345', { 
        tier: 'free', 
        userId: 'demo_user', 
        usage: { daily: 0, monthly: 0 }, 
        company: 'Demo Company',
        email: 'demo@company.com',
        created: new Date().toISOString()
    }],
    ['pro_key_67890', { 
        tier: 'pro', 
        userId: 'pro_user', 
        usage: { daily: 0, monthly: 0 },
        company: 'Pro Entertainment LLC',
        email: 'api@proentertainment.com',
        created: new Date().toISOString()
    }]
]);

const usageStats = new Map();

// Authentication Middleware
const authenticate = async (req, res, next) => {
    try {
        // Check for API Key first
        const apiKey = req.headers['x-api-key'];
        if (apiKey && apiKeys.has(apiKey)) {
            const keyInfo = apiKeys.get(apiKey);
            req.apiKey = keyInfo;
            req.userId = keyInfo.userId;
            req.tier = keyInfo.tier;
            
            // Track usage
            keyInfo.usage.daily++;
            keyInfo.usage.monthly++;
            
            return next();
        }

        // Check for JWT token
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Provide API key in X-API-Key header or JWT token'
            });
        }

        // Validate with SSO service
        const ssoResponse = await axios.get('http://localhost:3001/auth/validate', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (ssoResponse.data.valid) {
            req.user = ssoResponse.data.user;
            req.userId = ssoResponse.data.user.id;
            req.tier = 'authenticated_user';
            next();
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Apply rate limiting based on tier
const rateLimitByTier = (req, res, next) => {
    const tier = req.tier || 'free';
    
    switch (tier) {
        case 'enterprise':
            return enterpriseLimit(req, res, next);
        case 'pro':
            return proTierLimit(req, res, next);
        default:
            return freeTierLimit(req, res, next);
    }
};

// Usage tracking middleware
const trackUsage = (service, cost = 0) => (req, res, next) => {
    const usage = {
        userId: req.userId,
        service,
        cost,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };
    
    const userUsage = usageStats.get(req.userId) || [];
    userUsage.push(usage);
    usageStats.set(req.userId, userUsage);
    
    req.usage = usage;
    next();
};

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Gateway Overview
 *     description: Get information about available APIs and pricing
 *     responses:
 *       200:
 *         description: API gateway information
 */
app.get('/', (req, res) => {
    res.json({
        name: 'After Dark Systems API Gateway',
        description: 'Unified access to 15+ entertainment platforms',
        version: '1.0.0',
        status: 'operational',
        platforms: {
            'Dating Safety': 'undateable.me',
            'Political Sentiment': 'politicalmemes.xyz',
            'Crypto Risk': '9lives.xyz', 
            'Trust Verification': 'veribits.com',
            'Job Market': 'outofwork.life',
            'Cannabis Data': 'smokeoutnyc',
            'Scientific Dating': 'nerdycupid.com',
            'Communication': 'nitetext',
            'Adult Entertainment': 'aeims'
        },
        pricing: API_PRICING,
        endpoints: {
            documentation: '/docs',
            pricing: '/pricing',
            health: '/health',
            services: {
                dating_safety: '/v1/dating/safety',
                political_sentiment: '/v1/political/sentiment',
                crypto_risk: '/v1/crypto/risk',
                trust_verification: '/v1/trust/verify',
                job_market: '/v1/jobs/market',
                cannabis_data: '/v1/cannabis/data',
                dating_match: '/v1/dating/match',
                authentication: '/v1/auth',
                communication: '/v1/communication'
            }
        },
        contact: {
            sales: 'sales@afterdarksys.com',
            support: 'api@afterdarksys.com',
            enterprise: 'enterprise@afterdarksys.com'
        }
    });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     responses:
 *       200:
 *         description: Service health status
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            'api_gateway': 'operational',
            'authentication': 'operational',
            'rate_limiting': 'operational',
            'usage_tracking': 'operational'
        },
        stats: {
            total_api_keys: apiKeys.size,
            total_requests_today: Array.from(usageStats.values()).flat().length
        }
    });
});

/**
 * @swagger
 * /pricing:
 *   get:
 *     summary: API Pricing Information
 *     responses:
 *       200:
 *         description: Detailed pricing for all API services
 */
app.get('/pricing', (req, res) => {
    res.json({
        pricing_model: 'pay_per_use',
        currency: 'USD',
        services: API_PRICING,
        tiers: {
            free: {
                requests_per_hour: 100,
                price: 0,
                features: ['Basic API access', 'Standard support']
            },
            pro: {
                requests_per_hour: 1000,
                monthly_fee: 99,
                features: ['Increased limits', 'Priority support', 'Analytics dashboard']
            },
            enterprise: {
                requests_per_hour: 10000,
                monthly_fee: 999,
                features: ['Highest limits', 'Dedicated support', 'Custom integrations', 'SLA']
            }
        },
        volume_discounts: {
            '10000+_requests': '10% discount',
            '100000+_requests': '20% discount',
            '1000000+_requests': 'Custom pricing'
        }
    });
});

// Dating Safety API (Undateable.me integration)
/**
 * @swagger
 * /v1/dating/safety:
 *   post:
 *     summary: Check dating safety profile
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               platform:
 *                 type: string
 *     responses:
 *       200:
 *         description: Safety check results
 */
app.post('/v1/dating/safety', 
    authenticate, 
    rateLimitByTier, 
    trackUsage('dating_safety', API_PRICING.dating_safety.price),
    [
        body('email').optional().isEmail(),
        body('name').optional().isLength({ min: 2 }),
        body('platform').optional().isIn(['tinder', 'bumble', 'hinge', 'match', 'okcupid'])
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, name, platform } = req.body;
        
        // Mock safety check (integrate with actual Undateable.me API)
        const safetyScore = Math.floor(Math.random() * 100);
        const riskLevel = safetyScore > 70 ? 'low' : safetyScore > 40 ? 'medium' : 'high';
        
        res.json({
            safety_score: safetyScore,
            risk_level: riskLevel,
            flags: safetyScore < 50 ? ['multiple_reports', 'suspicious_activity'] : [],
            recommendations: riskLevel === 'high' ? 
                ['Proceed with caution', 'Meet in public places', 'Verify identity'] :
                ['Standard precautions recommended'],
            checked_platforms: platform ? [platform] : ['all'],
            cost: req.usage.cost,
            timestamp: new Date().toISOString()
        });
    }
);

// Political Sentiment API (PoliticalMemes.xyz integration)
/**
 * @swagger
 * /v1/political/sentiment:
 *   get:
 *     summary: Get political sentiment analysis
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: politician
 *         schema:
 *           type: string
 *         description: Politician name
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d]
 *     responses:
 *       200:
 *         description: Sentiment analysis results
 */
app.get('/v1/political/sentiment',
    authenticate,
    rateLimitByTier,
    trackUsage('political_sentiment', API_PRICING.political_sentiment.price),
    [
        query('politician').optional().isLength({ min: 2 }),
        query('timeframe').optional().isIn(['1d', '7d', '30d'])
    ],
    (req, res) => {
        const { politician, timeframe = '7d' } = req.query;
        
        // Mock sentiment data (integrate with PoliticalMemes.xyz)
        const sentiment = (Math.random() - 0.5) * 2; // -1 to 1
        const confidence = Math.random();
        
        res.json({
            politician: politician || 'trending_politicians',
            sentiment_score: sentiment,
            confidence_level: confidence,
            timeframe,
            sources: {
                twitter: Math.floor(Math.random() * 1000),
                reddit: Math.floor(Math.random() * 500),
                news: Math.floor(Math.random() * 100)
            },
            trending_topics: ['economy', 'healthcare', 'climate'],
            cost: req.usage.cost,
            timestamp: new Date().toISOString()
        });
    }
);

// Crypto Risk API (9Lives.xyz integration)
/**
 * @swagger
 * /v1/crypto/risk:
 *   post:
 *     summary: Assess cryptocurrency risk
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contract_address:
 *                 type: string
 *               token_symbol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk assessment results
 */
app.post('/v1/crypto/risk',
    authenticate,
    rateLimitByTier,
    trackUsage('crypto_risk', API_PRICING.crypto_risk.price),
    [
        body('contract_address').optional().isLength({ min: 40, max: 42 }),
        body('token_symbol').optional().isLength({ min: 2, max: 10 })
    ],
    (req, res) => {
        const { contract_address, token_symbol } = req.body;
        
        // Mock risk assessment (integrate with 9Lives.xyz)
        const riskScore = Math.floor(Math.random() * 100);
        const riskLevel = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';
        
        res.json({
            contract_address: contract_address || 'unknown',
            token_symbol: token_symbol || 'unknown',
            risk_score: riskScore,
            risk_level: riskLevel,
            risk_factors: riskScore > 60 ? 
                ['rug_pull_potential', 'low_liquidity', 'anonymous_team'] :
                ['standard_risk'],
            recommendations: riskLevel === 'high' ? 
                ['Avoid investment', 'High risk of loss'] :
                ['Proceed with caution', 'Do additional research'],
            ai_analysis: 'Advanced AI risk assessment completed',
            cost: req.usage.cost,
            timestamp: new Date().toISOString()
        });
    }
);

// Trust Verification API (VeriBits.com integration)
/**
 * @swagger
 * /v1/trust/verify:
 *   post:
 *     summary: Verify file, email, or transaction
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [file, email, transaction]
 *               data:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification results
 */
app.post('/v1/trust/verify',
    authenticate,
    rateLimitByTier,
    trackUsage('trust_verification', API_PRICING.trust_verification.price),
    [
        body('type').isIn(['file', 'email', 'transaction']),
        body('data').notEmpty()
    ],
    (req, res) => {
        const { type, data } = req.body;
        
        // Mock verification (integrate with VeriBits.com)
        const verified = Math.random() > 0.3; // 70% verification rate
        const trustScore = Math.floor(Math.random() * 100);
        
        res.json({
            verification_id: uuidv4(),
            type,
            verified,
            trust_score: trustScore,
            verification_method: type === 'file' ? 'sha256_hash' : 
                                type === 'email' ? 'smtp_validation' : 'blockchain_check',
            metadata: {
                processed_at: new Date().toISOString(),
                verification_time: Math.floor(Math.random() * 1000) + 'ms'
            },
            badge_url: verified ? `https://veribits.com/badge/${uuidv4()}` : null,
            cost: req.usage.cost,
            timestamp: new Date().toISOString()
        });
    }
);

// Usage Analytics
/**
 * @swagger
 * /v1/analytics/usage:
 *   get:
 *     summary: Get API usage analytics
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics
 */
app.get('/v1/analytics/usage', authenticate, (req, res) => {
    const userUsage = usageStats.get(req.userId) || [];
    
    const analytics = {
        total_requests: userUsage.length,
        total_cost: userUsage.reduce((sum, usage) => sum + usage.cost, 0),
        services_used: [...new Set(userUsage.map(u => u.service))],
        daily_usage: userUsage.filter(u => {
            const today = new Date().toISOString().split('T')[0];
            return u.timestamp.startsWith(today);
        }).length,
        cost_breakdown: {}
    };
    
    // Calculate cost breakdown by service
    userUsage.forEach(usage => {
        analytics.cost_breakdown[usage.service] = 
            (analytics.cost_breakdown[usage.service] || 0) + usage.cost;
    });
    
    res.json(analytics);
});

// API Key Management
/**
 * @swagger
 * /v1/keys:
 *   post:
 *     summary: Generate new API key
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: API key created
 */
app.post('/v1/keys', authenticate, [
    body('tier').isIn(['free', 'pro', 'enterprise']),
    body('company').optional().isLength({ min: 2 })
], (req, res) => {
    const { tier = 'free', company } = req.body;
    
    const apiKey = `ads_${tier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const keyInfo = {
        tier,
        userId: req.userId,
        usage: { daily: 0, monthly: 0 },
        company: company || 'Unknown',
        email: req.user?.email || 'unknown@example.com',
        created: new Date().toISOString()
    };
    
    apiKeys.set(apiKey, keyInfo);
    
    res.status(201).json({
        api_key: apiKey,
        tier,
        limits: {
            requests_per_hour: tier === 'free' ? 100 : tier === 'pro' ? 1000 : 10000
        },
        created: keyInfo.created
    });
});

// Enterprise endpoint for custom integrations
app.get('/v1/enterprise/platforms', authenticate, (req, res) => {
    if (req.tier !== 'enterprise') {
        return res.status(403).json({ error: 'Enterprise tier required' });
    }
    
    res.json({
        available_platforms: [
            { name: 'AEIMS', type: 'adult_entertainment', custom_integration: true },
            { name: 'SmokeoutNYC', type: 'cannabis_gaming', custom_integration: true },
            { name: 'VeriBits.com', type: 'trust_verification', custom_integration: true },
            { name: 'PoliticalMemes.xyz', type: 'political', custom_integration: true },
            { name: '9Lives.xyz', type: 'crypto_risk', custom_integration: true },
            { name: 'NerdyCupid.com', type: 'dating_api', custom_integration: true },
            { name: 'OutOfWork.life', type: 'job_search', custom_integration: true },
            { name: 'Undateable.me', type: 'dating_safety', custom_integration: true },
            { name: 'NiteText', type: 'communication', custom_integration: true }
        ],
        contact: 'enterprise@afterdarksys.com'
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('API Gateway Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        request_id: uuidv4(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        available_endpoints: [
            '/',
            '/health', 
            '/pricing',
            '/docs',
            '/v1/dating/safety',
            '/v1/political/sentiment',
            '/v1/crypto/risk',
            '/v1/trust/verify',
            '/v1/analytics/usage'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 After Dark Systems API Gateway running on port ${PORT}`);
    console.log(`💰 Revenue engine serving ${Object.keys(API_PRICING).length} monetized APIs`);
    console.log(`📊 Documentation available at http://localhost:${PORT}/docs`);
    console.log(`🔑 Demo API key: demo_key_12345`);
});

module.exports = app;