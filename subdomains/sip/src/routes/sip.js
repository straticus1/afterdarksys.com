const express = require('express');
const { authenticateToken, requirePermission } = require('./auth');
const router = express.Router();

// Apply authentication to all SIP routes
router.use(authenticateToken);

// Get FreeSWITCH status
router.get('/status', requirePermission('sip:basic'), async (req, res) => {
  try {
    const status = await req.aeimsClient.getFreeSwitchStatus();
    res.json(status);
  } catch (error) {
    console.error('FreeSWITCH status error:', error.message);
    res.status(500).json({ error: 'Failed to get FreeSWITCH status' });
  }
});

// Get active channels
router.get('/channels', requirePermission('sip:basic'), async (req, res) => {
  try {
    const channels = await req.aeimsClient.getFreeSwitchChannels();
    res.json(channels);
  } catch (error) {
    console.error('FreeSWITCH channels error:', error.message);
    res.status(500).json({ error: 'Failed to get FreeSWITCH channels' });
  }
});

// Execute FreeSWITCH command
router.post('/command', requirePermission('sip:operator'), async (req, res) => {
  try {
    const { command, args } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await req.aeimsClient.executeFreeSwitchCommand(command, args);
    
    // Log command execution for audit
    console.log(`FreeSWITCH command executed by ${req.user.email}: ${command} ${args?.join(' ') || ''}`);
    
    res.json(result);
  } catch (error) {
    console.error('FreeSWITCH command error:', error.message);
    res.status(500).json({ error: 'Command execution failed' });
  }
});

// Get system health
router.get('/health', requirePermission('sip:basic'), async (req, res) => {
  try {
    const health = await req.aeimsClient.healthCheck();
    res.json(health);
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Get system telemetry
router.get('/telemetry', requirePermission('sip:operator'), async (req, res) => {
  try {
    const telemetry = await req.aeimsClient.getSystemTelemetry();
    res.json(telemetry);
  } catch (error) {
    console.error('Telemetry error:', error.message);
    res.status(500).json({ error: 'Failed to get telemetry data' });
  }
});

// Get call file statistics
router.get('/callfile-stats', requirePermission('sip:basic'), async (req, res) => {
  try {
    const stats = await req.aeimsClient.getCallFileStats();
    res.json(stats);
  } catch (error) {
    console.error('Call file stats error:', error.message);
    res.status(500).json({ error: 'Failed to get call file statistics' });
  }
});

// Create call file
router.post('/callfile', requirePermission('sip:operator'), async (req, res) => {
  try {
    const callFileData = req.body;

    // Validate required fields
    if (!callFileData.channel || !callFileData.context || !callFileData.extension) {
      return res.status(400).json({ 
        error: 'Missing required fields: channel, context, extension' 
      });
    }

    // Add user information for audit
    callFileData.createdBy = req.user.userId;
    callFileData.createdByEmail = req.user.email;

    const result = await req.aeimsClient.createCallFile(callFileData);
    
    // Log call file creation
    console.log(`Call file created by ${req.user.email}: ${callFileData.channel} -> ${callFileData.extension}`);
    
    res.json(result);
  } catch (error) {
    console.error('Call file creation error:', error.message);
    res.status(500).json({ error: 'Call file creation failed' });
  }
});

// Get call file status
router.get('/callfile/:id/status', requirePermission('sip:basic'), async (req, res) => {
  try {
    const { id } = req.params;
    const status = await req.aeimsClient.getCallFileStatus(id);
    res.json(status);
  } catch (error) {
    console.error('Call file status error:', error.message);
    res.status(500).json({ error: 'Failed to get call file status' });
  }
});

module.exports = router;