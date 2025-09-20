const express = require('express');
const { authenticateToken, requirePermission } = require('./auth');
const router = express.Router();

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// Get dashboard overview
router.get('/overview', requirePermission('sip:basic'), async (req, res) => {
  try {
    const [
      activeCalls,
      systemHealth,
      callFileStats,
      callAnalytics
    ] = await Promise.all([
      req.aeimsClient.getActiveCalls().catch(() => ({ calls: [], count: 0 })),
      req.aeimsClient.healthCheck().catch(() => ({ status: 'unknown' })),
      req.aeimsClient.getCallFileStats().catch(() => ({ total: 0, pending: 0, completed: 0, failed: 0 })),
      req.aeimsClient.getCallAnalytics('24h').catch(() => ({ totalCalls: 0, totalDuration: 0, averageDuration: 0 }))
    ]);

    const overview = {
      activeCalls: {
        count: activeCalls.count || 0,
        calls: activeCalls.calls || []
      },
      systemHealth: {
        status: systemHealth.status || 'unknown',
        uptime: systemHealth.uptime || 0,
        lastCheck: new Date().toISOString()
      },
      callFiles: {
        total: callFileStats.total || 0,
        pending: callFileStats.pending || 0,
        completed: callFileStats.completed || 0,
        failed: callFileStats.failed || 0
      },
      analytics: {
        last24h: {
          totalCalls: callAnalytics.totalCalls || 0,
          totalDuration: callAnalytics.totalDuration || 0,
          averageDuration: callAnalytics.averageDuration || 0
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(overview);
  } catch (error) {
    console.error('Dashboard overview error:', error.message);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
});

// Get real-time statistics
router.get('/stats/realtime', requirePermission('sip:basic'), async (req, res) => {
  try {
    const [
      channels,
      telemetry
    ] = await Promise.all([
      req.aeimsClient.getFreeSwitchChannels().catch(() => ({ channels: [] })),
      req.aeimsClient.getSystemTelemetry().catch(() => ({ cpu: 0, memory: 0, disk: 0 }))
    ]);

    const stats = {
      channels: {
        active: channels.channels?.length || 0,
        inbound: channels.channels?.filter(c => c.direction === 'inbound').length || 0,
        outbound: channels.channels?.filter(c => c.direction === 'outbound').length || 0
      },
      system: {
        cpu: telemetry.cpu || 0,
        memory: telemetry.memory || 0,
        disk: telemetry.disk || 0
      },
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Real-time stats error:', error.message);
    res.status(500).json({ error: 'Failed to get real-time statistics' });
  }
});

// Get call analytics with time range
router.get('/analytics/:timeRange', requirePermission('sip:basic'), async (req, res) => {
  try {
    const { timeRange } = req.params;
    const validRanges = ['1h', '6h', '24h', '7d', '30d'];
    
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({ 
        error: 'Invalid time range',
        validRanges 
      });
    }

    const analytics = await req.aeimsClient.getCallAnalytics(timeRange);
    
    res.json({
      timeRange,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get user-specific dashboard data
router.get('/user-data', requirePermission('sip:basic'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [
      userDetails,
      billingInfo
    ] = await Promise.all([
      req.aeimsClient.getUserDetails(userId).catch(() => ({ id: userId, email: req.user.email })),
      req.aeimsClient.getBillingInfo(userId).catch(() => ({ balance: 0, usage: [] }))
    ]);

    const userData = {
      user: {
        id: userId,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        details: userDetails
      },
      billing: billingInfo,
      timestamp: new Date().toISOString()
    };

    res.json(userData);
  } catch (error) {
    console.error('User data error:', error.message);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Get system logs (admin only)
router.get('/logs', requirePermission('sip:admin'), async (req, res) => {
  try {
    const { limit = 100, level = 'all' } = req.query;
    
    // In production, this would query actual log storage
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'SIP Gateway started successfully',
        service: 'sip-gateway'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'AEIMS connection established',
        service: 'aeims-client'
      }
    ];

    res.json({
      logs: logs.slice(0, parseInt(limit)),
      total: logs.length,
      level,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logs error:', error.message);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Get configuration status
router.get('/config', requirePermission('sip:admin'), (req, res) => {
  try {
    const config = {
      sipGateway: {
        version: '1.0.0',
        port: process.env.PORT || 3005,
        environment: process.env.NODE_ENV || 'development'
      },
      aeims: {
        baseUrl: process.env.AEIMS_BASE_URL || 'http://localhost:8080',
        connected: req.aeimsClient.isConnected()
      },
      afterDarkSystems: {
        authUrl: process.env.AFTER_DARK_AUTH_URL || 'https://login.afterdarksys.com/api',
        ssoEnabled: !!process.env.AFTER_DARK_AUTH_URL
      },
      features: {
        realTimeEvents: true,
        webhooks: true,
        billing: true,
        analytics: true
      },
      timestamp: new Date().toISOString()
    };

    res.json(config);
  } catch (error) {
    console.error('Config error:', error.message);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

module.exports = router;