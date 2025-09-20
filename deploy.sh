#!/bin/bash

# After Dark Systems - Quick Deployment Script
# Wrapper for SuperDeploy integration

set -e

PROJECT_NAME="afterdarksys.com"
SUPERDEPLOY_PATH="/Users/ryan/development/SuperDeploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    local message=$2
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${level} ${message}"
}

# Check if SuperDeploy exists
if [ ! -f "${SUPERDEPLOY_PATH}/superdeploy" ]; then
    log "${RED}[ERROR]${NC}" "SuperDeploy not found at ${SUPERDEPLOY_PATH}"
    log "${YELLOW}[INFO]${NC}" "Please ensure SuperDeploy is installed and configured"
    exit 1
fi

# Display banner
echo ""
echo "🌙 After Dark Systems - Entertainment Technology Ecosystem"
echo "========================================================="
echo ""
echo "💰 $100M+ Valuation Potential"
echo "🎯 15+ Entertainment Platforms"
echo "🚀 The Stripe for Entertainment"
echo ""

# Check command line argument
case "${1:-help}" in
    "deploy")
        log "${GREEN}[INFO]${NC}" "Starting deployment of After Dark Systems ecosystem..."
        cd "${SUPERDEPLOY_PATH}"
        ./superdeploy deploy "${PROJECT_NAME}"
        ;;
    "check")
        log "${BLUE}[INFO]${NC}" "Checking deployment status..."
        cd "${SUPERDEPLOY_PATH}"
        ./superdeploy check "${PROJECT_NAME}"
        ;;
    "teardown")
        log "${YELLOW}[WARN]${NC}" "This will destroy all AWS resources!"
        read -p "Are you sure you want to continue? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "${SUPERDEPLOY_PATH}"
            ./superdeploy teardown "${PROJECT_NAME}"
        else
            log "${GREEN}[INFO]${NC}" "Teardown cancelled."
        fi
        ;;
    "refresh")
        log "${YELLOW}[INFO]${NC}" "Refreshing deployment (teardown + deploy)..."
        cd "${SUPERDEPLOY_PATH}"
        ./superdeploy refresh "${PROJECT_NAME}"
        ;;
    "logs")
        log "${BLUE}[INFO]${NC}" "Displaying recent SuperDeploy logs..."
        if [ -d "${SUPERDEPLOY_PATH}/logs" ]; then
            tail -f "${SUPERDEPLOY_PATH}/logs/superdeploy_$(date +%Y%m%d).log"
        else
            log "${RED}[ERROR]${NC}" "No logs directory found"
        fi
        ;;
    "status")
        log "${BLUE}[INFO]${NC}" "After Dark Systems Infrastructure Status"
        echo ""
        echo "🏠 Expected URLs (after deployment):"
        echo "   https://afterdarksys.com - Main corporate site"
        echo "   https://login.afterdarksys.com - Central SSO"
        echo "   https://api.afterdarksys.com - Revenue engine"
        echo "   https://admin.afterdarksys.com - Control panel"
        echo "   https://docs.afterdarksys.com - Documentation"
        echo "   https://billing.afterdarksys.com - Payment hub"
        echo "   https://status.afterdarksys.com - System health"
        echo "   https://analytics.afterdarksys.com - Intelligence"
        echo "   https://oss.afterdarksys.com - Open source"
        echo "   https://sip.afterdarksys.com - Telephony"
        echo ""
        echo "🎮 Platform Portfolio:"
        echo "   • AEIMS (Adult Entertainment)"
        echo "   • Undateable.me (Dating Safety)"
        echo "   • OutOfWork.life (Job Search)" 
        echo "   • PoliticalMemes.xyz (Political AI)"
        echo "   • 9Lives.xyz (Crypto Risk)"
        echo "   • NerdyCupid.com (Scientific Dating)"
        echo "   • VeriBits.com (Trust Verification)"
        echo "   • SmokeOut.NYC (Cannabis Gaming)"
        echo "   • And 7+ more platforms..."
        echo ""
        cd "${SUPERDEPLOY_PATH}"
        ./superdeploy check "${PROJECT_NAME}"
        ;;
    "help"|*)
        echo "After Dark Systems Deployment Commands:"
        echo ""
        echo "  $0 deploy     - Deploy the entire ecosystem"
        echo "  $0 check      - Check deployment status"
        echo "  $0 teardown   - Destroy all resources"
        echo "  $0 refresh    - Teardown and redeploy"
        echo "  $0 status     - Show infrastructure status"
        echo "  $0 logs       - Tail deployment logs"
        echo "  $0 help       - Show this help"
        echo ""
        echo "💡 This uses SuperDeploy for unified Terraform + Ansible deployment"
        echo "📖 See DEPLOYMENT.md for detailed documentation"
        ;;
esac

echo ""
echo "🌙 Always After Dark. Always Operational. Always Growing."