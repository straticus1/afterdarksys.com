# After Dark Systems - Deployment Guide

## Overview

This project is configured for deployment using the SuperDeploy system, which provides unified Terraform and Ansible deployment workflows for the After Dark Systems entertainment technology ecosystem.

## Prerequisites

### Required Tools
- [SuperDeploy](../SuperDeploy/) - Unified deployment system
- Terraform >= 1.0
- Ansible >= 2.9
- AWS CLI configured with appropriate credentials
- Docker (for local builds)
- jq (JSON processor)

### AWS Prerequisites
- Route 53 hosted zone for `afterdarksys.com`
- AWS credentials with appropriate permissions for:
  - ECS (Elastic Container Service)
  - EC2 (VPC, Subnets, Security Groups)
  - Route 53 (DNS management)
  - Application Load Balancer (ALB)
  - CloudWatch (Logging and monitoring)
  - ACM (SSL certificates)

## Quick Start with SuperDeploy

The project is already configured in the SuperDeploy build list. Use these commands:

```bash
# Navigate to SuperDeploy directory
cd /Users/ryan/development/SuperDeploy

# Check project status
./superdeploy check afterdarksys.com

# Deploy the entire ecosystem
./superdeploy deploy afterdarksys.com

# Check deployment status
./superdeploy check afterdarksys.com

# Teardown (if needed)
./superdeploy teardown afterdarksys.com

# Refresh (teardown + deploy)
./superdeploy refresh afterdarksys.com
```

## Manual Deployment

If you prefer to deploy manually without SuperDeploy:

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### 2. Deploy Infrastructure (Terraform)

```bash
cd terraform/
terraform init
terraform plan
terraform apply
```

### 3. Deploy Applications (Ansible)

```bash
cd ../ansible/
ansible-playbook -i inventory.yml deploy.yml
```

## Architecture

### Infrastructure Components

- **VPC**: Multi-AZ setup with public/private subnets
- **ECS Fargate**: Container orchestration for microservices
- **Application Load Balancer**: SSL termination and subdomain routing
- **Route 53**: DNS management for all subdomains
- **CloudWatch**: Centralized logging and monitoring
- **Auto Scaling**: CPU/Memory based scaling policies

### Services

| Service | Subdomain | Port | Description |
|---------|-----------|------|-------------|
| Main Site | afterdarksys.com | 8080 | Corporate website |
| Login Service | login.afterdarksys.com | 3001 | Central SSO |
| API Gateway | api.afterdarksys.com | 3002 | Revenue engine |

### Subdomain Strategy

The infrastructure supports the following subdomains:

- `login.afterdarksys.com` - Central SSO for all 15+ platforms
- `api.afterdarksys.com` - Unified API gateway (revenue engine)
- `admin.afterdarksys.com` - Master control panel
- `docs.afterdarksys.com` - Developer documentation
- `billing.afterdarksys.com` - Payment processing hub
- `status.afterdarksys.com` - System health monitoring
- `analytics.afterdarksys.com` - Business intelligence
- `oss.afterdarksys.com` - Open source projects
- `sip.afterdarksys.com` - Telephony gateway
- `webhooks.afterdarksys.com` - Event processing
- `cdn.afterdarksys.com` - Content delivery

## Platform Portfolio Integration

This infrastructure serves as the backbone for the After Dark Systems entertainment technology ecosystem:

### High Revenue Tier Platforms
- **AEIMS** - Adult entertainment infrastructure
- **PoliticalMemes.xyz** - AI-powered political engagement
- **9Lives.xyz** - Cryptocurrency risk management
- **SmokeOut.NYC** - Cannabis gaming platform

### Medium Revenue Tier Platforms
- **Undateable.me** - Dating safety and verification
- **OutOfWork.life** - Long-term unemployment job search
- **NerdyCupid.com** - Scientific dating API
- **VeriBits.com** - Trust verification system

## Business Value

### Revenue Potential
- **API Gateway**: $500K - $5M+ annually
- **Platform Operations**: Multi-million dollar potential
- **Enterprise Services**: $100K - $1M+ per client

### Valuation Estimate
- **Conservative**: $10M - $50M
- **Growth Scenario**: $25M - $100M+
- **Strategic Value**: $50M - $300M+

## Monitoring and Observability

### CloudWatch Integration
- Application logs: `/ecs/afterdarksys/[service-name]`
- Container insights enabled
- Custom business metrics
- Auto-scaling based on CPU/memory utilization

### Health Checks
- ALB target group health checks
- Container health checks
- Application-level health endpoints
- Route 53 health checks

### Alerting
- High CPU utilization (>80%)
- High memory utilization (>85%)
- Unhealthy ALB targets
- Service deployment failures

## Security

### SSL/TLS
- Wildcard SSL certificate for `*.afterdarksys.com`
- Certificate transparency logging enabled
- TLS 1.2+ enforcement

### Network Security
- Private subnets for application containers
- Security groups with least privilege access
- NAT gateways for outbound internet access

### Application Security
- Container-level security scanning
- Non-root container execution
- Environment variable management
- Rate limiting and DDoS protection

## Scaling and Performance

### Auto Scaling
- Target CPU utilization: 70%
- Target memory utilization: 80%
- Min capacity: 1 task per service
- Max capacity: 10 tasks per service

### Resource Allocation
- Main Site: 256 CPU / 512 MB Memory
- Login Service: 256 CPU / 512 MB Memory  
- API Gateway: 512 CPU / 1024 MB Memory

## Troubleshooting

### Common Issues

1. **Terraform State Lock**
   ```bash
   terraform force-unlock <lock-id>
   ```

2. **ECS Service Not Starting**
   ```bash
   aws ecs describe-services --cluster afterdarksys-cluster --services afterdarksys-[service]
   aws logs get-log-events --log-group-name /ecs/afterdarksys/[service]
   ```

3. **DNS Propagation Delays**
   - Wait 5-10 minutes for Route 53 changes
   - Use `dig` to verify DNS resolution

4. **SSL Certificate Issues**
   ```bash
   aws acm describe-certificate --certificate-arn <cert-arn>
   ```

### Log Locations
- SuperDeploy logs: `/Users/ryan/development/SuperDeploy/logs/`
- Deployment logs: `./logs/deployment.log`
- Application logs: CloudWatch `/ecs/afterdarksys/[service]`

## Support

For deployment issues or questions:
- Check SuperDeploy documentation: `/Users/ryan/development/SuperDeploy/README.md`
- Review CloudWatch logs for application errors
- Verify AWS credentials and permissions

## Strategic Positioning

This infrastructure positions After Dark Systems as **"The Stripe for Entertainment"** - the first comprehensive entertainment technology infrastructure provider with:

- 15+ live entertainment platforms
- Cross-platform data and services
- Battle-tested enterprise scale
- No direct competitor with this breadth
- $100M+ total addressable market potential

The subdomain strategy creates multiple revenue streams while providing a unified experience for enterprise clients seeking entertainment technology solutions.