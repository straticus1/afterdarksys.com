/**
 * After Dark Systems - API Gateway Demo
 * Quick demo of the revenue engine capabilities
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cors());

// Demo API pricing
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

// Main endpoint
app.get('/', (req, res) => {
    res.json({
        name: '🌙 After Dark Systems API Gateway',
        description: 'Unified access to 15+ entertainment platforms',
        version: '1.0.0',
        status: 'operational',
        revenue_potential: '$500K - $5M+ annually',
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
        demo_endpoints: {
            dating_safety: '/api/dating/safety-demo',
            political_sentiment: '/api/political/sentiment-demo',
            crypto_risk: '/api/crypto/risk-demo',
            trust_verification: '/api/trust/verify-demo'
        },
        enterprise_contact: 'enterprise@afterdarksys.com'
    });
});

// Demo: Dating Safety API
app.post('/api/dating/safety-demo', (req, res) => {
    const { email, name, platform } = req.body;
    const safetyScore = Math.floor(Math.random() * 100);
    const riskLevel = safetyScore > 70 ? 'low' : safetyScore > 40 ? 'medium' : 'high';
    
    res.json({
        demo: true,
        service: 'Dating Safety Check',
        platform_source: 'Undateable.me',
        safety_score: safetyScore,
        risk_level: riskLevel,
        flags: safetyScore < 50 ? ['multiple_reports', 'suspicious_activity'] : [],
        cost: API_PRICING.dating_safety.price,
        enterprise_features: [
            'Real-time database access',
            'Bulk processing',
            'Cross-platform verification',
            'Custom risk thresholds'
        ]
    });
});

// Demo: Political Sentiment API
app.get('/api/political/sentiment-demo', (req, res) => {
    const { politician = 'trending_politicians' } = req.query;
    const sentiment = (Math.random() - 0.5) * 2; // -1 to 1
    
    res.json({
        demo: true,
        service: 'Political Sentiment Analysis',
        platform_source: 'PoliticalMemes.xyz',
        politician,
        sentiment_score: sentiment,
        confidence_level: Math.random(),
        sources: {
            twitter: Math.floor(Math.random() * 1000),
            reddit: Math.floor(Math.random() * 500),
            news: Math.floor(Math.random() * 100)
        },
        cost: API_PRICING.political_sentiment.price,
        enterprise_features: [
            'Real-time sentiment tracking',
            'Historical analysis',
            'AI-powered insights',
            'Custom alerts'
        ]
    });
});

// Demo: Crypto Risk API
app.post('/api/crypto/risk-demo', (req, res) => {
    const { contract_address, token_symbol } = req.body;
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';
    
    res.json({
        demo: true,
        service: 'Crypto Risk Assessment',
        platform_source: '9Lives.xyz',
        contract_address: contract_address || '0x1234...abcd',
        token_symbol: token_symbol || 'DEMO',
        risk_score: riskScore,
        risk_level: riskLevel,
        ai_analysis: 'Advanced AI risk assessment with machine learning',
        cost: API_PRICING.crypto_risk.price,
        enterprise_features: [
            'Live blockchain monitoring',
            'Rug pull prediction',
            'Whale tracking',
            'Portfolio protection'
        ]
    });
});

// Demo: Trust Verification API
app.post('/api/trust/verify-demo', (req, res) => {
    const { type, data } = req.body;
    const verified = Math.random() > 0.3;
    const trustScore = Math.floor(Math.random() * 100);
    
    res.json({
        demo: true,
        service: 'Trust Verification',
        platform_source: 'VeriBits.com',
        type: type || 'file',
        verified,
        trust_score: trustScore,
        verification_method: 'enterprise_grade',
        badge_url: verified ? 'https://veribits.com/badge/demo' : null,
        cost: API_PRICING.trust_verification.price,
        enterprise_features: [
            'Real-time verification',
            'Custom trust badges',
            'Webhook notifications',
            'Audit trail'
        ]
    });
});

// Revenue projection endpoint
app.get('/api/revenue-projection', (req, res) => {
    res.json({
        title: 'After Dark Systems - Revenue Projections',
        api_gateway_revenue: {
            conservative: '$500K annually',
            growth: '$2M annually',
            enterprise: '$5M+ annually'
        },
        pricing_model: 'pay_per_use + subscription tiers',
        enterprise_value: {
            platform_count: 15,
            market_coverage: [
                'Adult Entertainment ($97B market)',
                'Gaming ($200B market)', 
                'Dating ($3B market)',
                'Political ($1B market)',
                'Enterprise SaaS ($400B market)'
            ],
            competitive_advantage: 'Only comprehensive entertainment ecosystem'
        },
        contact: {
            enterprise_sales: 'enterprise@afterdarksys.com',
            api_partnerships: 'api@afterdarksys.com',
            investor_relations: 'investors@afterdarksys.com'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 After Dark Systems API Gateway Demo running on http://localhost:${PORT}`);
    console.log(`💰 Revenue engine demonstration ready`);
    console.log(`📊 Try the demo endpoints to see monetization potential`);
});

module.exports = app;