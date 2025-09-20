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
      const response = await this.client.get('/api/domains/list');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get domain list: ${error.message}`);
    }
  }
}

module.exports = AEIMSClient;