# Security Policy

## Security Summary

This document outlines the security measures implemented in SemesterFlow and provides guidance for reporting security vulnerabilities.

## Security Features

### 1. API Key Protection
- **Status**: ✅ SECURED
- All API keys are stored server-side in environment variables
- Frontend code never receives or bundles API keys
- API keys are never exposed in client-side bundles or network responses

### 2. Backend Security
- **Status**: ✅ SECURED
- Rate limiting: 100 requests per 15 minutes globally
- API-specific rate limiting: 20 requests per minute for AI endpoints
- Security headers:
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - X-XSS-Protection: 1; mode=block (XSS protection)
  - Referrer-Policy: strict-origin-when-cross-origin
- Input validation with 500KB payload size limits
- CORS configuration with configurable allowed origins

### 3. Database Security (Supabase)
- **Status**: ✅ SECURED
- Row Level Security (RLS) enabled on all tables
- User-based access control
- Secure authentication via Supabase Auth
- File storage with access controls

### 4. Dependency Security
- **Status**: ✅ SECURED
- All npm vulnerabilities resolved
- Regular dependency updates via npm audit
- Using latest stable versions of critical packages

## Security Audit Results

### CodeQL Analysis
- **Date**: 2025-12-06
- **Result**: ✅ 0 alerts found
- **Languages Scanned**: JavaScript, TypeScript

### NPM Audit
- **Date**: 2025-12-06
- **Result**: ✅ 0 vulnerabilities
- **Previously Fixed**: 
  - High severity: jws@4.0.0 (CVE-2024-869p-cjfg-cm3x) - HMAC verification vulnerability

### Build Security
- **Result**: ✅ No security issues in build process
- API keys not included in production bundles
- Source maps disabled in production

## Resolved Vulnerabilities

### Critical Issues Fixed (2025-12-06)

1. **API Key Exposure in Frontend**
   - **Severity**: CRITICAL
   - **Status**: ✅ FIXED
   - **Description**: GEMINI_API_KEY was being bundled into client-side code via vite.config.ts
   - **Resolution**: Removed all API key references from frontend, moved AI calls to backend

2. **Hardcoded API Access in Components**
   - **Severity**: HIGH
   - **Status**: ✅ FIXED
   - **Description**: ProcrastinationWidget and StudyPartner components made direct AI API calls from frontend
   - **Resolution**: Created backend endpoints (/api/procrastination, /api/study-partner/*) with streaming support

3. **Unused Code with API Key Exposure**
   - **Severity**: HIGH
   - **Status**: ✅ FIXED
   - **Description**: VectorDB.ts service exposed API keys unnecessarily
   - **Resolution**: Deleted unused VectorDB.ts file

4. **Dependency Vulnerability**
   - **Severity**: HIGH
   - **Status**: ✅ FIXED
   - **Description**: jws@4.0.0 had HMAC signature verification vulnerability
   - **Resolution**: Updated dependencies via npm audit fix

5. **Invalid Package Version**
   - **Severity**: MEDIUM
   - **Status**: ✅ FIXED
   - **Description**: @google/genai@^0.1.1 version didn't exist
   - **Resolution**: Updated to @google/genai@^1.31.0

## Security Best Practices

### For Developers

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use `.env.example` files as templates
   - Rotate API keys periodically
   - Use different keys for development and production

2. **API Keys**
   - Store all API keys server-side only
   - Never expose keys in client-side code
   - Use environment variables for all secrets
   - Implement key rotation policies

3. **Dependencies**
   - Run `npm audit` before each deployment
   - Keep dependencies updated
   - Review security advisories regularly
   - Use `npm audit fix` to automatically fix issues

4. **Code Review**
   - Review all code changes for security issues
   - Check for hardcoded secrets
   - Verify input validation
   - Ensure proper error handling

### For Deployment

1. **Production Configuration**
   - Set `NODE_ENV=production`
   - Configure production ALLOWED_ORIGINS
   - Enable HTTPS
   - Use a reverse proxy (nginx, Apache)
   - Implement additional rate limiting if needed

2. **Monitoring**
   - Monitor API usage patterns
   - Set up error tracking (Sentry)
   - Log security events
   - Monitor for unusual activity

3. **Infrastructure**
   - Use secure hosting providers
   - Keep server software updated
   - Implement firewall rules
   - Regular security audits

## Reporting Security Vulnerabilities

If you discover a security vulnerability in SemesterFlow, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly at: [security contact needed]
3. Provide detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We take security seriously and will respond promptly to all reports.

## Security Update Policy

- **Critical vulnerabilities**: Fixed within 24-48 hours
- **High severity**: Fixed within 1 week
- **Medium severity**: Fixed within 2 weeks
- **Low severity**: Fixed in next release cycle

Security updates are released as patch versions and documented in the changelog.

## Compliance

SemesterFlow follows security best practices including:
- OWASP Top 10 security guidelines
- Principle of least privilege
- Defense in depth
- Secure by default configuration

## Additional Resources

- [Server Security Documentation](server/README.md)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Last Updated

**Date**: 2025-12-06  
**Version**: 1.0.0  
**Security Scan Status**: ✅ All Clear
