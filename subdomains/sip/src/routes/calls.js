const express = require('express');
const { authenticateToken, requirePermission } = require('./auth');
const router = express.Router();

// Apply authentication to all call routes
router.use(authenticateToken);

// Get active calls
router.get('/active', requirePermission('sip:basic'), async (req, res) => {
  try {
    const activeCalls = await req.aeimsClient.getActiveCalls();
    res.json(activeCalls);
  } catch (error) {
    console.error('Active calls error:', error.message);
    res.status(500).json({ error: 'Failed to get active calls' });
  }
});

// Get call details
router.get('/:callId', requirePermission('sip:basic'), async (req, res) => {
  try {
    const { callId } = req.params;
    const callDetails = await req.aeimsClient.getCallDetails(callId);
    res.json(callDetails);
  } catch (error) {
    console.error('Call details error:', error.message);
    res.status(500).json({ error: 'Failed to get call details' });
  }
});

// Initiate a new call
router.post('/initiate', requirePermission('sip:operator'), async (req, res) => {
  try {
    const callData = req.body;

    // Validate required fields
    if (!callData.from || !callData.to) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to' 
      });
    }

    // Add user information for audit
    callData.initiatedBy = req.user.userId;
    callData.initiatedByEmail = req.user.email;

    const result = await req.aeimsClient.initiateCall(callData);
    
    // Log call initiation
    console.log(`Call initiated by ${req.user.email}: ${callData.from} -> ${callData.to}`);
    
    // Emit real-time event
    req.io.to(`user-${req.user.userId}`).emit('call-initiated', {
      callId: result.callId,
      from: callData.from,
      to: callData.to,
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Call initiation error:', error.message);
    res.status(500).json({ error: 'Call initiation failed' });
  }
});

// Hangup a call
router.post('/:callId/hangup', requirePermission('sip:operator'), async (req, res) => {
  try {
    const { callId } = req.params;
    const result = await req.aeimsClient.hangupCall(callId);
    
    // Log call hangup
    console.log(`Call ${callId} hung up by ${req.user.email}`);
    
    // Emit real-time event
    req.io.to(`user-${req.user.userId}`).emit('call-ended', {
      callId,
      reason: 'hangup',
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Call hangup error:', error.message);
    res.status(500).json({ error: 'Call hangup failed' });
  }
});

// Transfer a call
router.post('/:callId/transfer', requirePermission('sip:operator'), async (req, res) => {
  try {
    const { callId } = req.params;
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const result = await req.aeimsClient.transferCall(callId, destination);
    
    // Log call transfer
    console.log(`Call ${callId} transferred to ${destination} by ${req.user.email}`);
    
    // Emit real-time event
    req.io.to(`user-${req.user.userId}`).emit('call-transferred', {
      callId,
      destination,
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Call transfer error:', error.message);
    res.status(500).json({ error: 'Call transfer failed' });
  }
});

// Mute a call
router.post('/:callId/mute', requirePermission('sip:operator'), async (req, res) => {
  try {
    const { callId } = req.params;
    const { participant } = req.body;
    
    const result = await req.aeimsClient.muteCall(callId, participant);
    
    // Log call mute
    console.log(`Call ${callId} muted by ${req.user.email}${participant ? ` (participant: ${participant})` : ''}`);
    
    // Emit real-time event
    req.io.to(`user-${req.user.userId}`).emit('call-muted', {
      callId,
      participant,
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Call mute error:', error.message);
    res.status(500).json({ error: 'Call mute failed' });
  }
});

// Unmute a call
router.post('/:callId/unmute', requirePermission('sip:operator'), async (req, res) => {
  try {
    const { callId } = req.params;
    const { participant } = req.body;
    
    const result = await req.aeimsClient.unmuteCall(callId, participant);
    
    // Log call unmute
    console.log(`Call ${callId} unmuted by ${req.user.email}${participant ? ` (participant: ${participant})` : ''}`);
    
    // Emit real-time event
    req.io.to(`user-${req.user.userId}`).emit('call-unmuted', {
      callId,
      participant,
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Call unmute error:', error.message);
    res.status(500).json({ error: 'Call unmute failed' });
  }
});

// Get call analytics
router.get('/analytics/:timeRange?', requirePermission('sip:basic'), async (req, res) => {
  try {
    const timeRange = req.params.timeRange || '24h';
    const analytics = await req.aeimsClient.getCallAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Call analytics error:', error.message);
    res.status(500).json({ error: 'Failed to get call analytics' });
  }
});

module.exports = router;