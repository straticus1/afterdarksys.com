# 📞 After Dark Systems - SIP Gateway

**AEIMS Integration Service for After Dark Systems Ecosystem**

A sophisticated SIP gateway service that integrates the powerful AEIMS (Adult Entertainment Information Management System) telephony platform with the After Dark Systems ecosystem, providing web-based SIP management, real-time call control, and comprehensive telephony services.

## 🚀 Features

### Core Capabilities
- **AEIMS Integration**: Direct integration with FreeSWITCH via AEIMS call-service
- **Web Dashboard**: Real-time SIP management interface
- **SSO Authentication**: Integration with After Dark Systems login service
- **Real-time Events**: WebSocket-based live updates
- **Call Management**: Initiate, transfer, mute, and hangup calls
- **Call Files**: Advanced call file creation and monitoring
- **Billing Integration**: Automatic usage tracking and billing
- **Analytics**: Call statistics and performance metrics

### Security Features
- JWT-based authentication
- Role-based permissions (admin, operator, basic)
- Rate limiting and DDoS protection
- Helmet.js security headers
- Input validation and sanitization

### Integration Points
- **AEIMS Platform**: Complete telephony backend integration
- **After Dark Systems SSO**: Centralized authentication
- **Billing Service**: Usage tracking and cost calculation
- **Webhook System**: Event distribution and notifications

## 🏗️ Architecture

```
SIP Gateway (sip.afterdarksys.com)
├── 🌐 Web Dashboard (React-like interface)
├── 🔌 Socket.IO (Real-time updates)
├── 🔐 Authentication (SSO + Local)
├── 📡 AEIMS Client (FreeSWITCH integration)
├── 💰 Billing Integration
└── 📊 Analytics & Monitoring
```

## 📋 Installation

### Prerequisites
- Node.js 18+
- AEIMS Platform running
- After Dark Systems ecosystem

### Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the service**
```bash
# Development
npm run dev

# Production
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t afterdarksys-sip-gateway .

# Run container
docker run -p 3005:3005 \
  -e AEIMS_BASE_URL=http://your-aeims-host:8080 \
  -e AFTER_DARK_AUTH_URL=https://login.afterdarksys.com/api \
  afterdarksys-sip-gateway
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3005` |
| `AEIMS_BASE_URL` | AEIMS platform URL | `http://localhost:8080` |
| `AFTER_DARK_AUTH_URL` | SSO service URL | `https://login.afterdarksys.com/api` |
| `JWT_SECRET` | JWT signing secret | Required |
| `CALL_RATE_PER_MINUTE` | Billing rate | `0.05` |

### AEIMS Integration

The SIP Gateway requires a running AEIMS platform with:
- FreeSWITCH service active
- Call service API available
- Billing service integration
- Webhook support

## 🔐 Authentication

### SSO Integration
Integrates with After Dark Systems login service for centralized authentication.

### Local Development
For testing, use these default credentials:
- **Admin**: `admin@afterdarksys.com` / `admin123`
- **Operator**: `operator@afterdarksys.com` / `operator123`
- **User**: `user@afterdarksys.com` / `user123`

### Permissions
- `sip:basic` - View status and analytics
- `sip:operator` - Call control and management
- `sip:admin` - Full system administration

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sso-login` - SSO authentication
- `POST /api/auth/login` - Local login
- `GET /api/auth/verify` - Token verification

### SIP Management
- `GET /api/sip/status` - FreeSWITCH status
- `GET /api/sip/channels` - Active channels
- `POST /api/sip/command` - Execute FreeSWITCH command
- `POST /api/sip/callfile` - Create call file

### Call Control
- `GET /api/calls/active` - Active calls
- `POST /api/calls/initiate` - Initiate call
- `POST /api/calls/:id/hangup` - Hangup call
- `POST /api/calls/:id/transfer` - Transfer call
- `POST /api/calls/:id/mute` - Mute call

### Dashboard
- `GET /api/dashboard/overview` - Dashboard data
- `GET /api/dashboard/stats/realtime` - Real-time stats
- `GET /api/dashboard/analytics/:range` - Analytics

## 🔗 WebSocket Events

### Client → Server
- `subscribe-call-events` - Subscribe to call events
- `unsubscribe-call-events` - Unsubscribe from events

### Server → Client
- `call-event` - Call state changes
- `conference-event` - Conference updates
- `system-event` - System notifications

## 💰 Billing Integration

Automatic usage tracking for:
- Call duration billing
- SIP service usage
- API call metering
- Real-time cost calculation

## 📊 Monitoring & Analytics

### Health Checks
- `GET /health` - Service health
- AEIMS connectivity monitoring
- System resource tracking

### Analytics
- Call volume and duration
- Success/failure rates
- User activity metrics
- System performance data

## 🔧 Development

### Project Structure
```
sip/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Authentication routes
│   │   ├── sip.js       # SIP management routes
│   │   ├── calls.js     # Call control routes
│   │   ├── webhooks.js  # Webhook handlers
│   │   └── dashboard.js # Dashboard API
│   └── aeims-client.js  # AEIMS integration client
├── public/              # Web interface
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript
│   └── index.html       # Dashboard UI
├── server.js            # Main server
├── package.json         # Dependencies
├── Dockerfile           # Container config
└── .env.example         # Configuration template
```

### Adding Features
1. Create route handlers in `src/routes/`
2. Update AEIMS client for new integrations
3. Add UI components to public files
4. Update dashboard for new data

## 🔌 Integration Examples

### AEIMS Call Initiation
```javascript
const result = await aeimsClient.initiateCall({
  from: 'SIP/1001',
  to: 'SIP/1002',
  context: 'default'
});
```

### Real-time Event Handling
```javascript
socket.on('call-event', (event) => {
  if (event.type === 'call-started') {
    updateCallDisplay(event.data);
  }
});
```

## 🚀 Production Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  sip-gateway:
    build: .
    ports:
      - "3005:3005"
    environment:
      - AEIMS_BASE_URL=http://aeims:8080
      - AFTER_DARK_AUTH_URL=https://login.afterdarksys.com/api
    depends_on:
      - aeims
```

### Nginx Configuration
```nginx
location /sip/ {
    proxy_pass http://localhost:3005/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}
```

## 📞 Support

This SIP Gateway integrates with the AEIMS platform (v3.0) for complete telephony functionality including FreeSWITCH, call files, real-time monitoring, and enterprise-grade call management.

**Integration Requirements:**
- AEIMS Platform v3.0+
- FreeSWITCH with ESL enabled
- After Dark Systems authentication service
- Redis (optional, for session management)

For AEIMS platform documentation, see the main AEIMS repository.

---

**Part of the After Dark Systems Ecosystem** 🌙