const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AFTER_DARK_AUTH_URL = process.env.AFTER_DARK_AUTH_URL || 'https://login.afterdarksys.com/api';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// SSO Login with After Dark Systems
router.post('/sso-login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'SSO token required' });
    }

    // Verify token with After Dark Systems auth service
    const authResponse = await axios.post(`${AFTER_DARK_AUTH_URL}/verify`, {
      token
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const userData = authResponse.data;

    if (!userData.valid) {
      return res.status(401).json({ error: 'Invalid SSO token' });
    }

    // Generate SIP gateway token
    const sipToken = jwt.sign(
      {
        userId: userData.user.id,
        email: userData.user.email,
        role: userData.user.role,
        permissions: userData.user.permissions || ['sip:basic'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    res.json({
      success: true,
      token: sipToken,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        role: userData.user.role,
        permissions: userData.user.permissions || ['sip:basic']
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('SSO login error:', error.message);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Local login (for development/testing)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // In production, this would validate against a database
    // For now, using environment variables for demo users
    const validUsers = {
      'admin@afterdarksys.com': {
        id: 1,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        permissions: ['sip:admin', 'sip:operator', 'sip:basic']
      },
      'operator@afterdarksys.com': {
        id: 2,
        password: process.env.OPERATOR_PASSWORD || 'operator123',
        role: 'operator',
        permissions: ['sip:operator', 'sip:basic']
      },
      'user@afterdarksys.com': {
        id: 3,
        password: process.env.USER_PASSWORD || 'user123',
        role: 'user',
        permissions: ['sip:basic']
      }
    };

    const user = validUsers[email];
    if (!user || !bcrypt.compareSync(password, bcrypt.hashSync(user.password, 10))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: email,
        role: user.role,
        permissions: user.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: email,
        role: user.role,
        permissions: user.permissions
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const { userId, email, role, permissions } = req.user;

    const newToken = jwt.sign(
      {
        userId,
        email,
        role,
        permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    res.json({
      success: true,
      token: newToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error.message);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions
    }
  });
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a production environment, you would add the token to a blacklist
  // For now, just return success - client should delete the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Permission check middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        current: req.user.permissions
      });
    }
    next();
  };
};

module.exports = { router, authenticateToken, requirePermission };