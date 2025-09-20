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

  // Multisite management methods
  async getMultisiteStats() {
    try {
      const response = await this.client.get('/api/multisite/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get multisite stats: ${error.message}`);
    }
  }

  async getSiteUsers(domain, limit = 50) {
    try {
      const response = await this.client.get(`/api/multisite/users/${domain}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get users for ${domain}: ${error.message}`);
    }
  }

  async getSiteOperators(domain, limit = 50) {
    try {
      const response = await this.client.get(`/api/multisite/operators/${domain}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get operators for ${domain}: ${error.message}`);
    }
  }

  async getSiteRevenue(domain, period = 'monthly') {
    try {
      const response = await this.client.get(`/api/multisite/revenue/${domain}?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get revenue for ${domain}: ${error.message}`);
    }
  }

  async createNewSite(siteData) {
    try {
      const response = await this.client.post('/api/multisite/create', siteData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create site: ${error.message}`);
    }
  }

  async updateSiteConfig(domain, config) {
    try {
      const response = await this.client.put(`/api/multisite/sites/${domain}`, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update site ${domain}: ${error.message}`);
    }
  }

  async getSiteHealth(domain) {
    try {
      const response = await this.client.get(`/api/multisite/health/${domain}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get health for ${domain}: ${error.message}`);
    }
  }
}

module.exports = AEIMSClient;
