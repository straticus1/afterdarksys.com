# After Dark Systems Platform Documentation

A comprehensive entertainment technology ecosystem with enterprise infrastructure, API gateway, gaming platforms, and battle-tested security.

## 🏗️ Architecture Overview

```
afterdarksys.com/
├── admin-panel/          # Next.js admin dashboard
├── terraform/            # Infrastructure as Code (AWS ECS, ALB, Route 53)
├── ansible/              # Configuration management and deployment
├── api-demo.js           # API Gateway revenue engine ($500K-$5M annually)
├── subdomains/           # 11+ specialized subdomain configurations
├── docs/                 # Comprehensive documentation
├── prisma/               # Database schema and migrations
├── *.html                # Corporate website pages
└── DEPLOYMENT.md         # Enterprise deployment guide
```

## 🚀 Enterprise Infrastructure

### Multi-Subdomain Architecture
- `api.afterdarksys.com` - **API Gateway** (Revenue Engine)
- `login.afterdarksys.com` - Central SSO for 15+ platforms
- `admin.afterdarksys.com` - Master control panel
- `billing.afterdarksys.com` - Payment processing hub
- `analytics.afterdarksys.com` - Business intelligence dashboard
- Additional specialized subdomains for telephony, webhooks, CDN, etc.

### Cloud Infrastructure (Terraform)
- **ECS Fargate** - Container orchestration with auto-scaling
- **Application Load Balancer** - SSL termination and subdomain routing
- **Route 53** - DNS management for all subdomains
- **CloudWatch** - Centralized logging and monitoring
- **Multi-AZ deployment** - High availability and fault tolerance

## 💰 API Gateway & Revenue Engine

### Revenue Potential: $500K - $5M+ Annually
- **Pay-per-use pricing** with enterprise subscription tiers
- **15+ platform integrations** with unified API access
- **Enterprise-grade security** and rate limiting
- **"The Stripe for Entertainment"** positioning

### Available API Services
- Dating Safety API ($0.50/call) - Undateable.me
- Political Sentiment API ($0.25/call) - PoliticalMemes.xyz
- Crypto Risk Assessment ($1.00/call) - 9Lives.xyz
- Trust Verification ($0.75/call) - VeriBits.com
- Job Market Data ($0.30/call) - OutOfWork.life
- Cannabis Data API ($0.40/call) - SmokeOut.NYC
- Scientific Dating API ($0.20/call) - NerdyCupid.com
- SMS Communication API ($0.05/call) - NiteText

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ (for production)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/afterdarksys/platform.git
cd platform

# Install admin panel dependencies
cd admin-panel
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the admin dashboard.

### Default Credentials

```
Email: admin@afterdarksys.com
Password: AdminSecure2024!
```

**⚠️ Change these credentials immediately after first login!**

## 🔐 Security Features

### Authentication & Authorization
- ✅ Secure password hashing (bcryptjs, 12 rounds)
- ✅ Account lockout after failed attempts
- ✅ Two-factor authentication support
- ✅ Role-based access control (USER, ADMIN, SUPER_ADMIN)
- ✅ Session management with JWT
- ✅ Secure cookie handling

### Infrastructure Security
- ✅ Comprehensive security headers
- ✅ Content Security Policy (CSP)
- ✅ Rate limiting on API endpoints
- ✅ HTTPS enforcement in production
- ✅ SQL injection protection via Prisma ORM
- ✅ XSS protection

### Monitoring & Auditing
- ✅ Login attempt tracking
- ✅ Audit trail for sensitive actions
- ✅ System health monitoring
- ✅ Real-time metrics dashboard
- ✅ Security event logging

## 📊 Features

### Admin Dashboard
- **System Health Monitoring**: Real-time system status and metrics
- **User Management**: Create, edit, disable user accounts
- **Security Analytics**: Authentication metrics, failed login tracking
- **Audit Logs**: Comprehensive activity tracking
- **Role Management**: Granular permission system

### API Endpoints
- `/api/auth/login` - Secure authentication
- `/api/health` - System health checks
- `/api/metrics` - Performance and security metrics
- `/api/users` - User management (planned)

### Database Schema
- **Users**: Authentication and profile data
- **Sessions**: Active session tracking
- **LoginLogs**: Authentication attempt history
- **AuditLogs**: System activity tracking

## 🔧 Configuration

### Environment Variables

#### Development (.env)
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

#### Production (.env.production)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="64-character-production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="60000"
```

### Security Configuration

```typescript
// lib/security.ts
const securityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  requireTwoFactor: process.env.NODE_ENV === 'production'
};
```

## 📈 Monitoring

### Health Checks
- `GET /api/health` - System health status
- `HEAD /api/health` - Lightweight health ping

### Metrics
- `GET /api/metrics?type=overview` - Dashboard overview
- `GET /api/metrics?type=security` - Security analytics
- `GET /api/metrics?type=users` - User statistics
- `GET /api/metrics?type=auth` - Authentication metrics

### Dashboard
Visit `/dashboard` for real-time system monitoring:
- System uptime and resource usage
- Authentication success rates
- User activity metrics
- Security event tracking

## 🛡️ Security Best Practices

### For Developers
1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive configuration
3. **Validate all inputs** on both client and server
4. **Follow OWASP Top 10** security guidelines
5. **Keep dependencies updated** regularly

### For Operations
1. **Enable SSL/TLS** in production
2. **Use strong database passwords**
3. **Implement backup strategy**
4. **Monitor security logs** regularly
5. **Keep system patches current**

### For Users
1. **Use strong, unique passwords**
2. **Enable two-factor authentication**
3. **Log out after use**
4. **Report suspicious activity**
5. **Keep browsers updated**

## 🚀 Deployment

### Production Checklist
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Configure production database with SSL
- [ ] Set up HTTPS with valid certificate
- [ ] Enable monitoring and alerting
- [ ] Test all security features
- [ ] Update default admin credentials
- [ ] Enable 2FA for admin accounts

### Recommended Stack
- **Hosting**: Vercel, AWS, or DigitalOcean
- **Database**: PostgreSQL with SSL
- **CDN**: Cloudflare
- **Monitoring**: Sentry, DataDog
- **Secrets**: AWS Secrets Manager, HashiCorp Vault

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for changes
- Follow security best practices

## 🔧 CLI Architecture

For detailed information about command-line interfaces across the After Dark Systems ecosystem:

- **CLI Architecture Documentation**: [docs/CLI-ARCHITECTURE.md](CLI-ARCHITECTURE.md)
- **What has CLIs**: AEIMS platform (separate repo), individual services
- **What doesn't**: afterdarksys.com corporate website (static site)
- **Available Scripts**: `demo-ecosystem.sh`, `deploy.sh`

## 📞 Support

- **Email**: support@afterdarksys.com
- **Documentation**: See `/docs` directory
- **CLI Questions**: See [CLI-ARCHITECTURE.md](docs/CLI-ARCHITECTURE.md)
- **Issues**: GitHub Issues
- **Security**: security@afterdarksys.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the framework
- Prisma team for the ORM
- Vercel for deployment platform
- Open source security community

---

**Built with ❤️ by AfterDark Systems**  
*Professional entertainment platform solutions*