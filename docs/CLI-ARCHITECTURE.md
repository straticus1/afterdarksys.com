# CLI Architecture Documentation

> **Understanding the Command-Line Interface Structure Across the After Dark Systems Ecosystem**

## 🏗️ Overview

The After Dark Systems ecosystem consists of multiple repositories and platforms, each with their own specialized command-line tools and management interfaces. This document clarifies which CLIs exist where and how they work together.

## 📁 Repository Structure & CLI Ownership

### 1. afterdarksys.com (Corporate Website - This Repository)

**Type**: Corporate marketing website and ecosystem hub  
**CLI Status**: ❌ **No native CLI** (static website)  
**Available Scripts**: ✅ Demo and deployment automation only

```bash
# Available scripts in afterdarksys.com repo:
./demo-ecosystem.sh     # Corporate ecosystem demonstration
./deploy.sh            # SuperDeploy integration wrapper

# What this repository does NOT have:
❌ ./afterdarksys --help    # No native CLI
❌ ./ads-cli               # No CLI tools
❌ Website management CLI   # Static site, no CLI needed
```

### 2. AEIMS Platform (Separate Product Repository)

**Type**: Multi-tenant phone sex site hosting platform  
**CLI Status**: ✅ **Full-featured multisite management CLI**  
**Location**: Separate AEIMS repository (not in afterdarksys.com)

```bash
# AEIMS Platform CLI (separate repo):
./aeims multisite list                      # List hosted sites
./aeims multisite create newdomain.com      # Create new phone sex site
./aeims multisite users domain.com list     # User management per site
./aeims multisite operators domain.com list # Operator management
./aeims multisite stats                     # Platform-wide analytics
./aeims multisite revenue domain.com        # Revenue tracking
./aeims domain nginx reload                 # Infrastructure management
./aeims ssl renew --domain=example.com      # SSL certificate management
```

### 3. Individual Platform Services

Each platform service has its own management interface:

**API Gateway**: RESTful API management  
**SIP Gateway**: Telephony CLI tools  
**Admin Panel**: Web-based management  
**Analytics Service**: Data export CLIs  

## 🚀 Quick Start Guide by Use Case

### I want to demo the After Dark Systems ecosystem
```bash
# Repository: afterdarksys.com (this one)
git clone https://github.com/afterdarksys/afterdarksys.com
cd afterdarksys.com
./demo-ecosystem.sh
```

### I want to deploy the infrastructure
```bash  
# Repository: afterdarksys.com + SuperDeploy
cd afterdarksys.com
./deploy.sh deploy
```

### I want to manage phone sex sites
```bash
# Repository: AEIMS platform (separate)
# Contact: enterprise@afterdarksys.com for AEIMS platform access
./aeims multisite --help
```

### I want to use the API Gateway
```bash
# Access via HTTP API (no CLI)
curl -H "Authorization: Bearer <token>" \
     https://api.afterdarksys.com/platforms
```

## 🔧 Script Details

### afterdarksys.com Scripts

#### `demo-ecosystem.sh`
- **Purpose**: Corporate demonstration and ecosystem overview
- **What it does**: 
  - Starts local web server on port 8080
  - Displays business value proposition
  - Shows all platform URLs and revenue streams
  - Demonstrates $100M+ ecosystem potential
- **Usage**: `./demo-ecosystem.sh`

#### `deploy.sh`
- **Purpose**: Infrastructure deployment wrapper
- **What it does**:
  - Integrates with SuperDeploy for unified deployment
  - Deploys entire ecosystem to AWS ECS
  - Manages Terraform and Ansible automation
  - Provides status monitoring and health checks
- **Usage**: `./deploy.sh [deploy|status|logs|help]`

## 🏢 Enterprise Architecture

### Corporate Website (afterdarksys.com)
```
afterdarksys.com/
├── demo-ecosystem.sh    # ✅ Demo script
├── deploy.sh           # ✅ Deployment wrapper
├── index.html          # ✅ Static website files
├── products.html       # ✅ Product showcase
└── ecosystem-dashboard.html  # ✅ Business intelligence

❌ No CLI tools (not needed for static site)
```

### AEIMS Platform (Separate Repository)
```
aeims-platform/
├── bin/aeims           # ✅ Full CLI suite
├── src/cli/            # ✅ Command implementations
├── config/domains.json # ✅ Domain configurations
└── lib/management/     # ✅ Platform management

✅ Complete multisite management CLI
```

### Infrastructure Layer
```
SuperDeploy/
├── terraform/          # ✅ Infrastructure as Code
├── ansible/           # ✅ Configuration management
└── superdeploy        # ✅ Unified deployment CLI

✅ Infrastructure deployment and management
```

## 💡 Common Misconceptions

### ❌ "afterdarksys.com has an AEIMS CLI"
**Reality**: afterdarksys.com is just the corporate website. The AEIMS CLI is in the AEIMS platform repository.

### ❌ "I need a CLI to manage the corporate website"
**Reality**: afterdarksys.com is a static website. Use standard web development tools and the deployment script.

### ❌ "All platforms are managed from one CLI"
**Reality**: Each platform/service has its own management interface appropriate to its function.

## 🎯 Getting the Right Tools

### For Corporate Website Development:
```bash
# Standard web development workflow
git clone https://github.com/afterdarksys/afterdarksys.com
cd afterdarksys.com
python -m http.server 8080  # Local development
./deploy.sh deploy          # Production deployment
```

### For AEIMS Platform Management:
```bash
# Contact enterprise team for access
# Email: enterprise@afterdarksys.com
# Subject: "AEIMS Platform CLI Access Request"
```

### For API Gateway Access:
```bash
# Use standard HTTP tools
curl -X GET "https://api.afterdarksys.com/platforms" \
     -H "Authorization: Bearer <your-api-key>"
```

## 📞 Support & Access

### Corporate Website Issues:
- **Repository**: https://github.com/afterdarksys/afterdarksys.com
- **Issues**: GitHub Issues
- **Email**: support@afterdarksys.com

### AEIMS Platform Access:
- **Sales**: enterprise@afterdarksys.com  
- **API Access**: api@afterdarksys.com
- **Platform Demo**: Request via enterprise team

### Infrastructure Support:
- **Enterprise Clients**: Priority support channel
- **Deployment Issues**: infrastructure@afterdarksys.com
- **Emergency**: 24/7 enterprise support line

## 🔮 Future Roadmap

### Planned CLI Enhancements:
- **Unified Management CLI**: Single CLI for enterprise clients managing multiple platforms
- **AEIMS CLI Standalone Distribution**: Easier access to AEIMS management tools
- **Developer CLI Suite**: Tools for platform integration and API development
- **Monitoring CLI**: Real-time system health and analytics tools

---

**Built with ❤️ by After Dark Systems**  
*Professional entertainment platform solutions*