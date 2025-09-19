# Content Security Policy (CSP) Configuration

## Overview

The CSP has been updated to support external API integrations while maintaining security. The previous restrictive CSP would have broken functionality with external services.

## 🚨 **Previous Issue**

The original CSP configuration had:
```
"connect-src 'self'"
```

This would **block ALL external API calls**, breaking:
- Payment processors (Stripe, PayPal)
- Analytics (Google Analytics)
- CDNs and external resources
- Social authentication
- Entertainment APIs
- Monitoring services

## ✅ **Fixed Configuration**

The new CSP dynamically allows trusted external domains while maintaining security.

## Configuration Files

### `lib/csp-config.ts`
Central CSP configuration with:
- Environment-specific rules (dev vs production)
- Trusted domain lists for common services
- Service-specific CSP generators

### Usage Examples

#### 1. Basic API Integration
```typescript
// Your external API calls will now work
const response = await fetch('https://api.stripe.com/charges', {
  headers: { 'Authorization': 'Bearer sk_...' }
});
```

#### 2. Adding New Trusted Domains
```typescript
// In lib/csp-config.ts, add to TRUSTED_API_DOMAINS:
const TRUSTED_API_DOMAINS = [
  // ... existing domains
  'https://api.your-service.com',
  'https://*.your-cdn.com'  // Wildcards supported
];
```

#### 3. Service-Specific Configuration
```typescript
// Generate CSP for specific services
const csp = getServiceSpecificCSP(['stripe', 'google-analytics']);
```

## Current Trusted Domains

### Payment Processors
- Stripe: `api.stripe.com`, `js.stripe.com`
- PayPal: `api.paypal.com`, `www.paypal.com`

### Analytics & Monitoring
- Google Analytics: `www.google-analytics.com`, `analytics.google.com`
- Segment: `api.segment.io`, `cdn.segment.com`
- Sentry: `api.sentry.io`, `browser.sentry-cdn.com`

### Entertainment APIs (AfterDark specific)
- Spotify: `api.spotify.com`
- Twitch: `api.twitch.tv`
- YouTube: `api.youtube.com`
- TMDB: `api.themoviedb.org`

### CDNs
- jsDelivr: `cdn.jsdelivr.net`
- Unpkg: `unpkg.com`
- Cloudflare: `cdnjs.cloudflare.com`

### Cloud Services
- AWS: `*.amazonaws.com`
- Google Cloud: `storage.googleapis.com`

## Environment Differences

### Development CSP
```typescript
// More permissive for development
"connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* [trusted-domains]"
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"  // Allows hot reload
```

### Production CSP
```typescript
// Security-focused but functional
"connect-src 'self' [trusted-domains-only]"
"script-src 'self' 'unsafe-inline'"  // No unsafe-eval
"upgrade-insecure-requests"  // Force HTTPS
```

## Adding New External Services

### 1. For Entertainment Platforms
```typescript
// Add to TRUSTED_API_DOMAINS in csp-config.ts
'https://api.new-entertainment-service.com'
```

### 2. For CDNs or Assets
```typescript
// Add to TRUSTED_IMAGE_DOMAINS for images
'https://cdn.new-service.com'

// Add to TRUSTED_API_DOMAINS for API calls
'https://api.new-service.com'
```

### 3. For Authentication Providers
```typescript
// Add both API and redirect URLs
'https://auth.new-provider.com',
'https://api.new-provider.com'
```

## CSP Testing

### 1. Check Browser Console
```javascript
// Look for CSP violations in browser console:
// "Refused to connect to 'https://example.com' because it violates CSP"
```

### 2. Test External API Calls
```typescript
// Test your external integrations
const testExternalAPI = async () => {
  try {
    const response = await fetch('https://api.your-service.com/test');
    console.log('✅ External API accessible');
  } catch (error) {
    console.error('❌ CSP may be blocking:', error);
  }
};
```

### 3. CSP Report Endpoint (Optional)
```typescript
// Add to CSP header for violation reporting
"report-uri /api/csp-report"
```

## Security Considerations

### ✅ Maintained Security
- Still blocks untrusted domains
- Prevents XSS attacks
- Enforces HTTPS in production
- Restricts inline scripts in production

### ⚠️ Flexibility Trade-offs
- Allows specific trusted domains
- Permits 'unsafe-inline' for styles (required for most frameworks)
- Development mode is more permissive

### 🔒 Best Practices
1. **Regularly review** trusted domain list
2. **Remove unused** external services
3. **Monitor CSP violations** in production
4. **Test thoroughly** after adding new services
5. **Use most specific domains** possible (avoid wildcards when possible)

## Troubleshooting CSP Issues

### Problem: External API calls failing
```typescript
// 1. Check if domain is in trusted list
import { isExternalDomainTrusted } from '@/lib/csp-config';
console.log(isExternalDomainTrusted('api.example.com'));

// 2. Add domain to trusted list if legitimate
```

### Problem: Development hot reload broken
```typescript
// Ensure development CSP includes localhost:
"connect-src 'self' ws://localhost:* wss://localhost:*"
```

### Problem: Third-party widgets not loading
```typescript
// May need to add frame-src for embeds:
"frame-src 'self' https://trusted-widget-provider.com"
```

## Manual CSP Override (Emergency)

If you need to temporarily disable CSP:

```typescript
// In next.config.ts (ONLY for emergency debugging)
{
  key: 'Content-Security-Policy',
  value: "default-src 'unsafe-inline' 'unsafe-eval' *; script-src 'unsafe-inline' 'unsafe-eval' *;"
}
```

**⚠️ WARNING: Only use for debugging, never in production!**

## Integration Examples

### Stripe Integration
```typescript
// This will now work with the updated CSP
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_...');
// API calls to api.stripe.com and js.stripe.com are allowed
```

### Google Analytics
```typescript
// Analytics tracking will work
gtag('config', 'GA_MEASUREMENT_ID');
// Calls to www.google-analytics.com are allowed
```

### Entertainment APIs
```typescript
// Spotify API integration
const spotifyData = await fetch('https://api.spotify.com/v1/me', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

The updated CSP balances security with the practical needs of a modern entertainment platform that integrates with multiple external services.