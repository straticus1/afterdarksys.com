/**
 * After Dark Systems - Central SSO Authentication Service
 * Provides authentication for all 15+ entertainment platforms
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('rate-limiter-flexible');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Configuration
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "*.afterdarksys.com"]
        }
    }
}));

app.use(cors({
    origin: [
        'http://localhost:8080',
        /\.afterdarksys\.com$/,
        'https://afterdarksys.com',
        'https://www.afterdarksys.com'
    ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
const rateLimiter = new rateLimit.RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 5, // 5 attempts
    duration: 60, // per 60 seconds
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'afterdark-entertainment-systems-2024';
const JWT_EXPIRES_IN = '24h';

// In-memory user store (replace with database in production)
const users = new Map();
const sessions = new Map();

// Platform configurations for cross-platform SSO
const PLATFORMS = {
    'aeims': { name: 'AEIMS', type: 'adult_entertainment' },
    'smokeoutnyc': { name: 'SmokeoutNYC', type: 'cannabis_gaming' },
    'veribits': { name: 'VeriBits.com', type: 'trust_verification' },
    'politicalmemes': { name: 'PoliticalMemes.xyz', type: 'political' },
    'ninelives': { name: '9Lives.xyz', type: 'crypto_risk' },
    'nerdycupid': { name: 'NerdyCupid.com', type: 'dating_api' },
    'outofwork': { name: 'OutOfWork.life', type: 'job_search' },
    'undateable': { name: 'Undateable.me', type: 'dating_safety' },
    'nitetext': { name: 'NiteText', type: 'communication' }
};

// Middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies.ads_token;
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.get(decoded.userId);
        
        if (!user || !sessions.has(decoded.sessionId)) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        req.user = user;
        req.sessionId = decoded.sessionId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'afterdark-sso',
        timestamp: new Date().toISOString(),
        platforms: Object.keys(PLATFORMS).length
    });
});

// Get SSO Configuration
app.get('/config', (req, res) => {
    res.json({
        platforms: PLATFORMS,
        features: [
            'Cross-platform authentication',
            'Enterprise SSO integration',
            'Multi-factor authentication ready',
            'Session management',
            'Platform-specific permissions'
        ],
        endpoints: {
            login: '/auth/login',
            register: '/auth/register',
            validate: '/auth/validate',
            logout: '/auth/logout',
            platforms: '/auth/platforms'
        }
    });
});

// User Registration
app.post('/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('username').isLength({ min: 3, max: 30 }),
    body('platform').optional().isIn(Object.keys(PLATFORMS))
], async (req, res) => {
    try {
        await rateLimiter.consume(req.ip);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, username, platform } = req.body;
        
        // Check if user exists
        const existingUser = Array.from(users.values()).find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Create user
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = {
            id: userId,
            email,
            username,
            password: hashedPassword,
            platforms: platform ? [platform] : [],
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            permissions: {
                admin: false,
                api_access: true,
                platforms: platform ? { [platform]: 'user' } : {}
            }
        };

        users.set(userId, user);

        // Create session
        const sessionId = uuidv4();
        sessions.set(sessionId, {
            userId,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            platform: platform || 'web'
        });

        // Generate JWT
        const token = jwt.sign(
            { userId, sessionId, platform: platform || 'web' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set secure cookie
        res.cookie('ads_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            domain: process.env.NODE_ENV === 'production' ? '.afterdarksys.com' : 'localhost'
        });

        res.status(201).json({
            success: true,
            user: {
                id: userId,
                email,
                username,
                platforms: user.platforms,
                permissions: user.permissions
            },
            token,
            message: 'Registration successful'
        });

    } catch (error) {
        if (error instanceof rateLimit.RateLimiterRes) {
            return res.status(429).json({ error: 'Too many registration attempts' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
app.post('/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('platform').optional().isIn(Object.keys(PLATFORMS))
], async (req, res) => {
    try {
        await rateLimiter.consume(req.ip);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, platform } = req.body;
        
        // Find user
        const user = Array.from(users.values()).find(u => u.email === email);
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update user login time
        user.lastLogin = new Date().toISOString();
        
        // Add platform if not already added
        if (platform && !user.platforms.includes(platform)) {
            user.platforms.push(platform);
            user.permissions.platforms[platform] = 'user';
        }

        // Create session
        const sessionId = uuidv4();
        sessions.set(sessionId, {
            userId: user.id,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            platform: platform || 'web'
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, sessionId, platform: platform || 'web' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set secure cookie
        res.cookie('ads_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            domain: process.env.NODE_ENV === 'production' ? '.afterdarksys.com' : 'localhost'
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                platforms: user.platforms,
                permissions: user.permissions
            },
            token,
            message: 'Login successful'
        });

    } catch (error) {
        if (error instanceof rateLimit.RateLimiterRes) {
            return res.status(429).json({ error: 'Too many login attempts' });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Token Validation (for other services)
app.get('/auth/validate', authenticate, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            platforms: req.user.platforms,
            permissions: req.user.permissions
        },
        sessionId: req.sessionId
    });
});

// Get User Info
app.get('/auth/me', authenticate, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            platforms: req.user.platforms,
            permissions: req.user.permissions,
            lastLogin: req.user.lastLogin
        }
    });
});

// Platform Access
app.get('/auth/platforms', authenticate, (req, res) => {
    const userPlatforms = req.user.platforms.map(platformKey => ({
        key: platformKey,
        ...PLATFORMS[platformKey],
        permission: req.user.permissions.platforms[platformKey] || 'none'
    }));

    res.json({
        platforms: userPlatforms,
        available: Object.entries(PLATFORMS).map(([key, platform]) => ({
            key,
            ...platform,
            hasAccess: req.user.platforms.includes(key)
        }))
    });
});

// Logout
app.post('/auth/logout', authenticate, (req, res) => {
    sessions.delete(req.sessionId);
    
    res.clearCookie('ads_token', {
        domain: process.env.NODE_ENV === 'production' ? '.afterdarksys.com' : 'localhost'
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
});

// Admin Routes (for enterprise customers)
app.get('/admin/users', authenticate, (req, res) => {
    if (!req.user.permissions.admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const userList = Array.from(users.values()).map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        platforms: user.platforms,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
    }));

    res.json({ users: userList });
});

// Stats endpoint
app.get('/stats', authenticate, (req, res) => {
    const stats = {
        totalUsers: users.size,
        activeSessions: sessions.size,
        platformUsage: {},
        registrationsToday: 0
    };

    // Calculate platform usage
    for (const user of users.values()) {
        for (const platform of user.platforms) {
            stats.platformUsage[platform] = (stats.platformUsage[platform] || 0) + 1;
        }
    }

    // Calculate registrations today (simplified)
    const today = new Date().toISOString().split('T')[0];
    for (const user of users.values()) {
        if (user.createdAt.startsWith(today)) {
            stats.registrationsToday++;
        }
    }

    res.json(stats);
});

// Serve login page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>After Dark Systems - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container { 
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
        }
        .logo { 
            text-align: center;
            margin-bottom: 2rem;
        }
        .logo h1 {
            background: linear-gradient(45deg, #00f5ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2rem;
            font-weight: bold;
        }
        .subtitle {
            text-align: center;
            color: #ccc;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .form-group { 
            margin-bottom: 1.5rem;
        }
        label { 
            display: block;
            margin-bottom: 0.5rem;
            color: #ddd;
            font-weight: 500;
        }
        input, select { 
            width: 100%;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            color: white;
            font-size: 1rem;
        }
        input::placeholder { color: #aaa; }
        button { 
            width: 100%;
            padding: 1rem;
            background: linear-gradient(45deg, #00f5ff, #ff00ff);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
        .platforms {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        .platforms h3 {
            margin-bottom: 1rem;
            color: #ddd;
            font-size: 1.1rem;
        }
        .platform-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
            font-size: 0.8rem;
            color: #bbb;
        }
        .message {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
        }
        .success { background: rgba(0,255,0,0.2); border: 1px solid rgba(0,255,0,0.3); }
        .error { background: rgba(255,0,0,0.2); border: 1px solid rgba(255,0,0,0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🌙 After Dark</h1>
        </div>
        <div class="subtitle">Entertainment Systems Central Login</div>
        
        <div id="message"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="your@email.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Your password" required>
            </div>
            
            <div class="form-group">
                <label for="platform">Platform (Optional)</label>
                <select id="platform" name="platform">
                    <option value="">Select Platform</option>
                    <option value="aeims">AEIMS</option>
                    <option value="smokeoutnyc">SmokeoutNYC</option>
                    <option value="veribits">VeriBits.com</option>
                    <option value="politicalmemes">PoliticalMemes.xyz</option>
                    <option value="ninelives">9Lives.xyz</option>
                    <option value="nerdycupid">NerdyCupid.com</option>
                    <option value="outofwork">OutOfWork.life</option>
                    <option value="undateable">Undateable.me</option>
                    <option value="nitetext">NiteText</option>
                </select>
            </div>
            
            <button type="submit">Sign In</button>
        </form>
        
        <div class="platforms">
            <h3>🎮 Connected Platforms</h3>
            <div class="platform-list">
                <div>AEIMS</div>
                <div>SmokeoutNYC</div>
                <div>VeriBits.com</div>
                <div>PoliticalMemes.xyz</div>
                <div>9Lives.xyz</div>
                <div>NerdyCupid.com</div>
                <div>OutOfWork.life</div>
                <div>Undateable.me</div>
                <div>NiteText</div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '';
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="message success">✅ Login successful! Redirecting...</div>';
                    setTimeout(() => {
                        window.location.href = 'http://localhost:8080';
                    }, 1500);
                } else {
                    messageDiv.innerHTML = '<div class="message error">❌ ' + (result.error || 'Login failed') + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message error">❌ Network error</div>';
            }
        });
    </script>
</body>
</html>
    `);
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌙 After Dark Systems SSO Service running on port ${PORT}`);
    console.log(`🔐 Managing authentication for ${Object.keys(PLATFORMS).length} platforms`);
    console.log(`🚀 Ready for enterprise SSO integration`);
});

module.exports = app;