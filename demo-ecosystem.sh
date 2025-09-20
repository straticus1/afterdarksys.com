#!/bin/bash

# After Dark Systems - Ecosystem Demo Script
# Demonstrates the $100M+ entertainment technology infrastructure

echo "🌙 After Dark Systems - Entertainment Technology Ecosystem Demo"
echo "=============================================================="
echo ""

# Check if main site is running
echo "🔍 Checking main website..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Main site running at http://localhost:8080"
else
    echo "❌ Main site not running. Starting..."
    python3 -m http.server 8080 &
    sleep 2
    echo "✅ Main site started at http://localhost:8080"
fi

echo ""
echo "🚀 After Dark Systems Ecosystem URLs:"
echo "======================================"
echo ""
echo "🏠 Main Corporate Site:"
echo "   http://localhost:8080"
echo ""
echo "🎮 Platform Portfolio:"
echo "   http://localhost:8080/products.html"
echo ""
echo "📊 Ecosystem Dashboard ($100M+ Valuation Demo):"
echo "   http://localhost:8080/ecosystem-dashboard.html"
echo ""

echo "💰 Key Value Propositions:"
echo "=========================="
echo ""
echo "🎯 15+ Live Entertainment Platforms"
echo "    • Adult Entertainment (AEIMS)"
echo "    • Cannabis Gaming (SmokeoutNYC)"  
echo "    • Crypto Risk Management (9Lives.xyz)"
echo "    • Dating Safety (Undateable.me)"
echo "    • Political Engagement (PoliticalMemes.xyz)"
echo "    • Trust Verification (VeriBits.com)"
echo "    • Scientific Dating (NerdyCupid.com)"
echo "    • Job Search (OutOfWork.life)"
echo "    • And more..."
echo ""
echo "💸 Revenue Streams:"
echo "    • API Gateway: $500K - $5M+ annually"
echo "    • Platform Operations: Multi-million $ potential"
echo "    • Enterprise Services: $100K - $1M+ per client"
echo ""
echo "🏆 Valuation Estimate:"
echo "    • Conservative: $10M - $50M"
echo "    • Growth Scenario: $25M - $100M+"
echo "    • Strategic Value: $50M - $300M+"
echo ""

echo "🛠️ Subdomain Infrastructure (Future):"
echo "====================================="
echo ""
echo "🔐 login.afterdarksys.com - Central SSO"
echo "🌐 api.afterdarksys.com - Revenue Engine"
echo "👑 admin.afterdarksys.com - Master Control"
echo "📖 docs.afterdarksys.com - Developer Portal"
echo "💳 billing.afterdarksys.com - Payment Hub"
echo "📊 status.afterdarksys.com - System Health"
echo "📈 analytics.afterdarksys.com - Intelligence"
echo "☎️  sip.afterdarksys.com - Telephony Gateway"
echo "🔧 oss.afterdarksys.com - Open Source"
echo ""

echo "🎯 Business Positioning:"
echo "========================"
echo ""
echo "\"The Stripe for Entertainment\""
echo "• First comprehensive entertainment infrastructure"
echo "• Cross-platform data and services"
echo "• Battle-tested at enterprise scale"
echo "• No competitor has this breadth"
echo ""

echo "📞 Enterprise Contact:"
echo "====================="
echo ""
echo "• Sales: enterprise@afterdarksys.com"
echo "• API Partnerships: api@afterdarksys.com"
echo "• Investor Relations: investors@afterdarksys.com"
echo ""

echo "✨ Demo Complete! Visit the URLs above to explore the ecosystem."
echo ""
echo "🌙 Always After Dark. Always Operational. Always Growing."