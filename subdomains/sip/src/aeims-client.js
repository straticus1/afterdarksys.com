const axios = require('axios');
const EventEmitter = require('events');

class AEIMSClient extends EventEmitter {
  constructor(baseURL, options = {}) {
    super();
    this.baseURL = baseURL;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AfterDarkSystems-SIP-Gateway/1.0'
      }
    });
    
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.emit('auth_error', error);
        }
        return Promise.reject(error);
      }
    );
  }
  
  setAuthToken(token) {
    this.authToken = token;
  }
  
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`AEIMS health check failed: ${error.message}`);
    }
  }
  
  // FreeSWITCH Operations
  async getFreeSwitchStatus() {
    try {
      const response = await this.client.get('/api/freeswitch/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get FreeSWITCH status: ${error.message}`);
    }
  }
  
  async getFreeSwitchChannels() {
    try {
      const response = await this.client.get('/api/freeswitch/channels');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get FreeSWITCH channels: ${error.message}`);
    }
  }
  
  async executeFreeSwitchCommand(command, args = []) {
    try {
      const response = await this.client.post('/api/freeswitch/command', {
        command,
        args
      });
      return response.data;
    } catch (error) {
      throw new Error(`FreeSWITCH command failed: ${error.message}`);
    }
  }
  
  // Call Management
  async initiateCall(callData) {
    try {
      const response = await this.client.post('/api/calls/initiate', callData);
      return response.data;
    } catch (error) {
      throw new Error(`Call initiation failed: ${error.message}`);
    }
  }
  
  async hangupCall(callId) {
    try {
      const response = await this.client.post(`/api/calls/${callId}/hangup`);
      return response.data;
    } catch (error) {
      throw new Error(`Call hangup failed: ${error.message}`);
    }
  }
  
  async transferCall(callId, destination) {
    try {
      const response = await this.client.post(`/api/calls/${callId}/transfer`, {
        destination
      });
      return response.data;
    } catch (error) {
      throw new Error(`Call transfer failed: ${error.message}`);
    }
  }
  
  async muteCall(callId, participant = null) {
    try {
      const response = await this.client.post(`/api/calls/${callId}/mute`, {
        participant
      });
      return response.data;
    } catch (error) {
      throw new Error(`Call mute failed: ${error.message}`);
    }
  }
  
  async unmuteCall(callId, participant = null) {
    try {
      const response = await this.client.post(`/api/calls/${callId}/unmute`, {
        participant
      });
      return response.data;
    } catch (error) {
      throw new Error(`Call unmute failed: ${error.message}`);
    }
  }
  
  async getCallDetails(callId) {
    try {
      const response = await this.client.get(`/api/calls/${callId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call details: ${error.message}`);
    }
  }
  
  async getActiveCalls() {
    try {
      const response = await this.client.get('/api/calls/active');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get active calls: ${error.message}`);
    }
  }
  
  // Call Files Management
  async createCallFile(callFileData) {
    try {
      const response = await this.client.post('/api/callfiles/create', callFileData);
      return response.data;
    } catch (error) {
      throw new Error(`Call file creation failed: ${error.message}`);
    }
  }
  
  async getCallFileStatus(callFileId) {
    try {
      const response = await this.client.get(`/api/callfiles/${callFileId}/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call file status: ${error.message}`);
    }
  }
  
  async getCallFileStats() {
    try {
      const response = await this.client.get('/api/callfiles/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call file stats: ${error.message}`);
    }
  }
  
  // Conference Management
  async createConference(conferenceData) {
    try {
      const response = await this.client.post('/api/conference/create', conferenceData);
      return response.data;
    } catch (error) {
      throw new Error(`Conference creation failed: ${error.message}`);
    }
  }
  
  async joinConference(conferenceId, participantData) {
    try {
      const response = await this.client.post(`/api/conference/${conferenceId}/join`, participantData);
      return response.data;
    } catch (error) {
      throw new Error(`Conference join failed: ${error.message}`);
    }
  }
  
  async leaveConference(conferenceId, participantId) {
    try {
      const response = await this.client.post(`/api/conference/${conferenceId}/leave`, {
        participantId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Conference leave failed: ${error.message}`);
    }
  }
  
  async getConferenceDetails(conferenceId) {
    try {
      const response = await this.client.get(`/api/conference/${conferenceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get conference details: ${error.message}`);
    }
  }
  
  // User Management
  async getUserDetails(userId) {
    try {
      const response = await this.client.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user details: ${error.message}`);
    }
  }
  
  async createUser(userData) {
    try {
      const response = await this.client.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }
  
  // Billing Integration
  async getBillingInfo(userId) {
    try {
      const response = await this.client.get(`/api/billing/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get billing info: ${error.message}`);
    }
  }
  
  async recordUsage(usageData) {
    try {
      const response = await this.client.post('/api/billing/usage', usageData);
      return response.data;
    } catch (error) {
      throw new Error(`Usage recording failed: ${error.message}`);
    }
  }
  
  // Analytics and Monitoring
  async getSystemTelemetry() {
    try {
      const response = await this.client.get('/api/telemetry');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get system telemetry: ${error.message}`);
    }
  }
  
  async getCallAnalytics(timeRange = '24h') {
    try {
      const response = await this.client.get(`/api/analytics/calls?range=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call analytics: ${error.message}`);
    }
  }
  
  // Utility methods
  async retry(operation, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }
  
  isConnected() {
    return this.healthCheck()
      .then(() => true)
      .catch(() => false);
  }
}

module.exports = AEIMSClient;