// After Dark Systems SIP Gateway Dashboard JavaScript

class SIPDashboard {
    constructor() {
        this.socket = null;
        this.token = localStorage.getItem('sipToken');
        this.user = null;
        this.refreshInterval = null;
        this.events = [];
        
        this.init();
    }
    
    init() {
        // Check if user is logged in
        if (!this.token) {
            this.showLogin();
            return;
        }
        
        // Verify token and load dashboard
        this.verifyToken()
            .then(() => {
                this.hideLogin();
                this.initSocket();
                this.loadDashboard();
                this.setupEventHandlers();
                this.startRefresh();
            })
            .catch(() => {
                this.showLogin();
            });
    }
    
    async verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Token invalid');
            }
            
            const data = await response.json();
            this.user = data.user;
            document.getElementById('userEmail').textContent = this.user.email;
            
            return data;
        } catch (error) {
            localStorage.removeItem('sipToken');
            throw error;
        }
    }
    
    showLogin() {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }
    
    hideLogin() {
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
    }
    
    initSocket() {
        this.socket = io({
            auth: {
                token: this.token
            }
        });
        
        this.socket.on('connect', () => {
            this.showConnectionStatus('connected');
            this.socket.emit('subscribe-call-events', this.user.userId);
        });
        
        this.socket.on('disconnect', () => {
            this.showConnectionStatus('disconnected');
        });
        
        this.socket.on('call-event', (event) => {
            this.handleCallEvent(event);
        });
        
        this.socket.on('conference-event', (event) => {
            this.handleConferenceEvent(event);
        });
        
        this.socket.on('system-event', (event) => {
            this.handleSystemEvent(event);
        });
        
        this.socket.on('call-initiated', (event) => {
            this.addEvent('call-started', `Call initiated: ${event.from} → ${event.to}`, event);
            this.refreshActiveCalls();
        });
        
        this.socket.on('call-ended', (event) => {
            this.addEvent('call-ended', `Call ended: ${event.callId}`, event);
            this.refreshActiveCalls();
        });
    }
    
    showConnectionStatus(status) {
        let statusDiv = document.querySelector('.connection-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'connection-status';
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.className = `connection-status ${status}`;
        
        switch (status) {
            case 'connected':
                statusDiv.innerHTML = '<i class="bi bi-wifi"></i> Connected';
                break;
            case 'disconnected':
                statusDiv.innerHTML = '<i class="bi bi-wifi-off"></i> Disconnected';
                break;
            case 'connecting':
                statusDiv.innerHTML = '<i class="bi bi-arrow-repeat"></i> Connecting...';
                break;
        }
        
        if (status === 'connected') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            statusDiv.style.display = 'block';
        }
    }
    
    setupEventHandlers() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.login();
        });
        
        // Initiate call form
        document.getElementById('initiateCallForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.initiateCall();
        });
        
        // Create call file form
        document.getElementById('createCallFileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createCallFile();
        });
        
        // Tab change handlers
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('href');
                if (target === '#calls') {
                    this.refreshActiveCalls();
                }
            });
        });
    }
    
    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('sipToken', this.token);
            
            document.getElementById('userEmail').textContent = this.user.email;
            
            this.hideLogin();
            this.initSocket();
            this.loadDashboard();
            this.startRefresh();
            
            errorDiv.classList.add('d-none');
            
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('d-none');
        }
    }
    
    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        localStorage.removeItem('sipToken');
        this.token = null;
        this.user = null;
        
        if (this.socket) {
            this.socket.disconnect();
        }
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        location.reload();
    }
    
    async loadDashboard() {
        try {
            // Load overview data
            const overview = await this.apiCall('/api/dashboard/overview');
            this.updateOverview(overview);
            
            // Load system status
            const status = await this.apiCall('/api/sip/status');
            this.updateFreeSwitchStatus(status);
            
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.showSystemAlert('Failed to load dashboard data', 'warning');
        }
    }
    
    updateOverview(data) {
        document.getElementById('activeCallsCount').textContent = data.activeCalls.count;
        document.getElementById('systemHealth').textContent = data.systemHealth.status;
        document.getElementById('totalCallFiles').textContent = data.callFiles.total;
        document.getElementById('pendingCallFiles').textContent = data.callFiles.pending;
        document.getElementById('callsLast24h').textContent = data.analytics.last24h.totalCalls;
        document.getElementById('avgDuration').textContent = `${Math.round(data.analytics.last24h.averageDuration)}s`;
        
        // Update system health indicator
        const healthElement = document.getElementById('systemHealth');
        const healthClass = data.systemHealth.status === 'healthy' ? 'text-success' : 
                           data.systemHealth.status === 'warning' ? 'text-warning' : 'text-danger';
        healthElement.className = healthClass;
    }
    
    updateFreeSwitchStatus(data) {
        const statusDiv = document.getElementById('freeswitchStatus');
        const aeimsDiv = document.getElementById('aeimsStatus');
        
        if (data.status === 'running') {
            statusDiv.innerHTML = `
                <span class="status-indicator status-healthy"></span>
                <strong>Running</strong><br>
                <small class="text-muted">Uptime: ${this.formatUptime(data.uptime)}</small>
            `;
        } else {
            statusDiv.innerHTML = `
                <span class="status-indicator status-error"></span>
                <strong>Not Running</strong><br>
                <small class="text-danger">FreeSWITCH is not responding</small>
            `;
        }
        
        aeimsDiv.innerHTML = `
            <span class="status-indicator status-healthy"></span>
            <strong>Connected</strong><br>
            <small class="text-muted">AEIMS integration active</small>
        `;
    }
    
    async refreshActiveCalls() {
        try {
            const calls = await this.apiCall('/api/calls/active');
            this.updateActiveCallsTable(calls);
        } catch (error) {
            console.error('Failed to refresh active calls:', error);
        }
    }
    
    updateActiveCallsTable(calls) {
        const tbody = document.getElementById('activeCallsTable');
        
        if (!calls.calls || calls.calls.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No active calls</td></tr>';
            return;
        }
        
        tbody.innerHTML = calls.calls.map(call => `
            <tr>
                <td>${call.id}</td>
                <td>${call.from}</td>
                <td>${call.to}</td>
                <td>${this.formatDuration(call.duration)}</td>
                <td><span class="badge bg-success">${call.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="dashboard.muteCall('${call.id}')">
                        <i class="bi bi-mic-mute"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="dashboard.hangupCall('${call.id}')">
                        <i class="bi bi-telephone-x"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    async initiateCall() {
        const from = document.getElementById('fromNumber').value;
        const to = document.getElementById('toNumber').value;
        
        try {
            const result = await this.apiCall('/api/calls/initiate', 'POST', {
                from, to
            });
            
            this.addEvent('call-started', `Call initiated: ${from} → ${to}`, result);
            document.getElementById('initiateCallForm').reset();
            
        } catch (error) {
            this.showSystemAlert(`Failed to initiate call: ${error.message}`, 'danger');
        }
    }
    
    async createCallFile() {
        const channel = document.getElementById('channel').value;
        const context = document.getElementById('context').value;
        const extension = document.getElementById('extension').value;
        
        try {
            const result = await this.apiCall('/api/sip/callfile', 'POST', {
                channel, context, extension
            });
            
            this.addEvent('system', `Call file created: ${channel} → ${extension}`, result);
            document.getElementById('createCallFileForm').reset();
            
        } catch (error) {
            this.showSystemAlert(`Failed to create call file: ${error.message}`, 'danger');
        }
    }
    
    async hangupCall(callId) {
        try {
            await this.apiCall(`/api/calls/${callId}/hangup`, 'POST');
            this.addEvent('call-ended', `Call ${callId} hung up`);
            this.refreshActiveCalls();
        } catch (error) {
            this.showSystemAlert(`Failed to hangup call: ${error.message}`, 'danger');
        }
    }
    
    async muteCall(callId) {
        try {
            await this.apiCall(`/api/calls/${callId}/mute`, 'POST');
            this.addEvent('system', `Call ${callId} muted`);
        } catch (error) {
            this.showSystemAlert(`Failed to mute call: ${error.message}`, 'danger');
        }
    }
    
    async apiCall(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API call failed');
        }
        
        return response.json();
    }
    
    addEvent(type, message, data = null) {
        const event = {
            type,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.events.unshift(event);
        
        // Keep only last 100 events
        if (this.events.length > 100) {
            this.events = this.events.slice(0, 100);
        }
        
        this.updateEventLog();
    }
    
    updateEventLog() {
        const logDiv = document.getElementById('eventLog');
        
        if (this.events.length === 0) {
            logDiv.innerHTML = '<div class="text-muted">Waiting for events...</div>';
            return;
        }
        
        logDiv.innerHTML = this.events.map(event => `
            <div class="event-item">
                <div class="event-timestamp">${new Date(event.timestamp).toLocaleTimeString()}</div>
                <span class="event-type ${event.type}">[${event.type.toUpperCase()}]</span>
                ${event.message}
            </div>
        `).join('');
    }
    
    handleCallEvent(event) {
        this.addEvent(event.type, `Call event: ${event.type}`, event.data);
        if (event.type === 'call-started' || event.type === 'call-ended') {
            this.refreshActiveCalls();
        }
    }
    
    handleConferenceEvent(event) {
        this.addEvent('conference', `Conference: ${event.type}`, event.data);
    }
    
    handleSystemEvent(event) {
        this.addEvent('system', `System: ${event.type}`, event.data);
    }
    
    showSystemAlert(message, type = 'info') {
        const alert = document.getElementById('systemAlert');
        const alertText = document.getElementById('systemAlertText');
        
        alert.className = `alert alert-${type}`;
        alertText.textContent = message;
        alert.classList.remove('d-none');
        
        setTimeout(() => {
            alert.classList.add('d-none');
        }, 5000);
    }
    
    startRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadDashboard();
        }, 30000); // Refresh every 30 seconds
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

// Global functions
function clearEvents() {
    dashboard.events = [];
    dashboard.updateEventLog();
}

function logout() {
    dashboard.logout();
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SIPDashboard();
});