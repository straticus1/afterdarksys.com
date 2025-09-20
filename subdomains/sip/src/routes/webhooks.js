const express = require('express');
const { authenticateToken, requirePermission } = require('./auth');
const router = express.Router();

// Webhook endpoint for AEIMS events (no auth required for incoming webhooks)
router.post('/aeims-events', async (req, res) => {
  try {
    const event = req.body;
    
    // Validate webhook signature if configured
    const webhookSecret = process.env.AEIMS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-aeims-signature'];
      // Add signature validation logic here
    }
    
    console.log('AEIMS webhook event received:', event.type);
    
    // Process different event types
    switch (event.type) {
      case 'call.started':
        // Emit to all connected clients
        req.io.emit('call-event', {
          type: 'call-started',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'call.ended':
        // Record usage for billing
        if (event.data.duration && event.data.userId) {
          try {
            await req.aeimsClient.recordUsage({
              userId: event.data.userId,
              type: 'call',
              duration: event.data.duration,
              cost: calculateCallCost(event.data.duration),
              timestamp: event.data.endTime
            });
          } catch (usageError) {
            console.error('Failed to record usage:', usageError.message);
          }
        }
        
        req.io.emit('call-event', {
          type: 'call-ended',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'call.transferred':
        req.io.emit('call-event', {
          type: 'call-transferred',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'conference.created':
        req.io.emit('conference-event', {
          type: 'conference-created',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'conference.participant.joined':
        req.io.emit('conference-event', {
          type: 'participant-joined',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'conference.participant.left':
        req.io.emit('conference-event', {
          type: 'participant-left',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'system.health':
        req.io.emit('system-event', {
          type: 'health-update',
          data: event.data,
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        console.log('Unknown event type:', event.type);
        req.io.emit('unknown-event', {
          type: event.type,
          data: event.data,
          timestamp: new Date().toISOString()
        });
    }
    
    res.json({ success: true, processed: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Register webhook endpoint with AEIMS
router.post('/register', authenticateToken, requirePermission('sip:admin'), async (req, res) => {
  try {
    const { events, url } = req.body;
    
    if (!events || !url) {
      return res.status(400).json({ error: 'Events array and URL required' });
    }
    
    // Register webhook with AEIMS
    // This would depend on AEIMS API for webhook registration
    const webhookData = {
      url: url || `https://sip.afterdarksys.com/api/webhooks/aeims-events`,
      events: events,
      secret: process.env.AEIMS_WEBHOOK_SECRET,
      registeredBy: req.user.userId
    };
    
    // Store webhook registration (this would go to database in production)
    console.log('Webhook registered:', webhookData);
    
    res.json({
      success: true,
      webhook: webhookData,
      message: 'Webhook registered successfully'
    });
    
  } catch (error) {
    console.error('Webhook registration error:', error.message);
    res.status(500).json({ error: 'Webhook registration failed' });
  }
});

// List registered webhooks
router.get('/list', authenticateToken, requirePermission('sip:admin'), async (req, res) => {
  try {
    // In production, this would query the database
    const webhooks = [
      {
        id: 1,
        url: 'https://sip.afterdarksys.com/api/webhooks/aeims-events',
        events: ['call.started', 'call.ended', 'call.transferred'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json(webhooks);
    
  } catch (error) {
    console.error('Webhook list error:', error.message);
    res.status(500).json({ error: 'Failed to get webhook list' });
  }
});

// Test webhook
router.post('/test', authenticateToken, requirePermission('sip:admin'), async (req, res) => {
  try {
    const testEvent = {
      type: 'test.event',
      data: {
        message: 'This is a test webhook event',
        timestamp: new Date().toISOString(),
        testBy: req.user.email
      }
    };
    
    req.io.emit('webhook-test', testEvent);
    
    res.json({
      success: true,
      event: testEvent,
      message: 'Test webhook sent'
    });
    
  } catch (error) {
    console.error('Webhook test error:', error.message);
    res.status(500).json({ error: 'Webhook test failed' });
  }
});

// Calculate call cost (simple pricing model)
function calculateCallCost(duration) {
  const ratePerMinute = parseFloat(process.env.CALL_RATE_PER_MINUTE) || 0.05;
  const minutes = Math.ceil(duration / 60);
  return minutes * ratePerMinute;
}

module.exports = router;