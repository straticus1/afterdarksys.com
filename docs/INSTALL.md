# Installation Guide

Complete installation guide for the AfterDark Systems platform.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn 1.22+)
- **Database**: PostgreSQL 12+ (production) or SQLite (development)
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 10GB available space

### Development Tools
```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify npm version
npm --version   # Should be 9+

# Install global dependencies (optional)
npm install -g prisma
```

## 🚀 Quick Installation

### 1. Clone Repository
```bash
git clone https://github.com/afterdarksys/platform.git
cd platform
```

### 2. Install Dependencies
```bash
# Navigate to admin panel
cd admin-panel

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Generate a secure NextAuth secret
openssl rand -base64 32

# Edit .env file with your configuration
nano .env
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the admin dashboard.

## 🔧 Detailed Configuration

### Environment Variables

#### Required Variables
```bash
# Database connection
DATABASE_URL="file:./dev.db"  # SQLite for development

# NextAuth configuration
NEXTAUTH_SECRET="your-64-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

#### Optional Variables
```bash
# Admin default password (development only)
ADMIN_DEFAULT_PASSWORD="your-secure-password"

# Rate limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="60000"

# Logging
LOG_LEVEL="info"
```

### Generating Secure Secrets

#### NextAuth Secret
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online generator (use with caution)
# Visit: https://generate-secret.vercel.app/32
```

#### Database Passwords
```bash
# Generate secure database password
openssl rand -base64 24
```

## 🗄️ Database Setup

### Development (SQLite)
```bash
# Default configuration - no additional setup required
DATABASE_URL="file:./dev.db"

# Initialize database
npx prisma db push
npx prisma db seed
```

### Production (PostgreSQL)

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### 2. Create Database and User
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE afterdark_production;

-- Create user with strong password
CREATE USER afterdark_user WITH ENCRYPTED PASSWORD 'your-secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE afterdark_production TO afterdark_user;

-- Enable required extensions
\c afterdark_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit
\q
```

#### 3. Configure SSL Certificate
```bash
# Generate SSL certificate for database
openssl req -new -text -out server.req -keyout server.key -nodes
openssl rsa -in server.key -out server.key
openssl req -x509 -in server.req -text -key server.key -out server.crt

# Set permissions
chmod 600 server.key
chmod 644 server.crt
```

#### 4. Update Environment
```bash
# Production database URL with SSL
DATABASE_URL="postgresql://afterdark_user:your-secure-password@localhost:5432/afterdark_production?sslmode=require&sslcert=server.crt&sslkey=server.key"
```

### Database Migration
```bash
# Apply schema changes
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## 🔐 Security Setup

### 1. SSL/TLS Certificate

#### Development (Self-signed)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update Next.js to use HTTPS (optional for development)
npm install --save-dev https-localhost
```

#### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate files will be in:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 2. Firewall Configuration
```bash
# Ubuntu/Debian - UFW
sudo ufw enable
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw deny 3000/tcp     # Block direct access to Next.js

# CentOS/RHEL - firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Reverse Proxy (Nginx)
```nginx
# /etc/nginx/sites-available/afterdark
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🚀 Production Deployment

### 1. Build Application
```bash
# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Test production build locally
npm start
```

### 2. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'afterdark-admin',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/admin-panel',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/afterdark/error.log',
    out_file: '/var/log/afterdark/out.log',
    log_file: '/var/log/afterdark/combined.log',
    instances: 2,
    exec_mode: 'cluster'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 3. Monitoring Setup
```bash
# Install monitoring tools
npm install -g @pm2/io

# Connect to PM2 monitoring (optional)
pm2 link <secret> <public>

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔍 Verification

### 1. Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check with authentication
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/metrics
```

### 2. Security Validation
```bash
# Check security headers
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check database connection
npx prisma db seed
```

### 3. Performance Testing
```bash
# Install testing tools
npm install -g artillery

# Basic load test
echo '
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/api/health"
' > load-test.yml

artillery run load-test.yml
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -h localhost -U afterdark_user -d afterdark_production
```

#### Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod 755 .

# Fix Node.js permissions
sudo chown -R $USER:$(id -gn $USER) ~/.npm
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Log Locations
- **Application logs**: `/var/log/afterdark/`
- **Nginx logs**: `/var/log/nginx/`
- **PostgreSQL logs**: `/var/log/postgresql/`
- **PM2 logs**: `~/.pm2/logs/`

### Getting Help
- **Documentation**: Check `docs/README.md`
- **Issues**: Create GitHub issue
- **Support**: support@afterdarksys.com
- **Security**: security@afterdarksys.com

## 📚 Next Steps

After successful installation:

1. **Change default credentials** immediately
2. **Enable two-factor authentication** for admin accounts
3. **Review security settings** in the admin dashboard
4. **Set up monitoring and alerting**
5. **Configure backup strategy**
6. **Review audit logs** regularly

See `docs/README.md` for usage instructions and feature documentation.