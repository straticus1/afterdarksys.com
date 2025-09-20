const axios = require('axios');

class AEIMSClient {
  constructor(baseURL = 'http://localhost:3000', apiKey = null) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
  }

  async getDomains() {
    try {
      // Updated for AEIMS v3.0.1 API structure
      const response = await this.client.get('/api/domains');
      
      // Handle the new v3.0 response format
      if (response.data && response.data.success) {
        return {
          success: true,
          domains: response.data.data,
          total: response.data.total,
          version: '3.0.1'
        };
      } else {
        return response.data;
      }
    } catch (error) {
      throw new Error(`Failed to get domain list: ${error.message}`);
    }
  }

  async getDomainStatus(domain) {
    try {
      const response = await this.client.get(`/api/domains/${domain}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get domain status for ${domain}: ${error.message}`);
    }
  }

  async toggleDomain(domain) {
    try {
      const response = await this.client.post(`/api/domains/${domain}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to toggle domain ${domain}: ${error.message}`);
    }
  }
}

module.exports = AEIMSClient;