# n8n Code Source Analysis

## 📦 NPM Package Installation (Not Repository Clone)

The n8n core code comes from **NPM package installation**, not a git repository clone:

````json
# n8n Enterprise Security Hardening Guide

## 📦 Architecture Overview

### NPM Package Installation (Not Repository Clone)

The n8n core code comes from **NPM package installation**, not a git repository clone:

```json
// From package.json
"dependencies": {
  "n8n": "^1.0.0",  // ← This is the key!
}
````

When you ran `npm install`, it downloaded:

- **n8n version 1.117.3** (as noted in sessions.md)
- **2135 packages total** (massive dependency tree)
- All stored in `node_modules/` (which is .gitignored)

### 🏗️ Project Architecture

**Your Project** = Wrapper/Dashboard around n8n:

```
Your Custom Code:
├── index.js                    # Express API server (port 3000)
├── scripts/data-sanitizer.js   # Security layer
├── playwright/jira-scraper.js  # Web automation
├── configs/integrations.json   # Platform configs
└── workflows/                  # Your n8n workflow definitions

n8n Core (in node_modules/):
├── n8n/                       # Complete n8n platform
│   ├── packages/core/         # Core workflow engine
│   ├── packages/editor-ui/    # Web interface
│   ├── packages/nodes-base/   # Built-in nodes
│   └── packages/cli/          # Command line interface
```

## 🚨 Critical Security Vulnerabilities Detected

### Current Status: **29 vulnerabilities (8 moderate, 6 high, 15 critical)**

### High-Risk Vulnerabilities:

1. **form-data (CRITICAL)**: Unsafe random boundary generation
2. **axios (HIGH)**: DoS vulnerability through data size check bypass
3. **semver (HIGH)**: Regular Expression Denial of Service
4. **Azure Identity (MODERATE)**: Elevation of Privilege
5. **nodemailer (MODERATE)**: Email domain interpretation conflict
6. **validator.js (MODERATE)**: URL validation bypass

## 🔒 Enterprise Security Hardening Recommendations

### 1. Immediate Actions (Critical Priority)

```bash
# Pin exact versions for production
npm install --save-exact n8n@1.117.3
npm install --save-exact axios@1.12.0
npm install --save-exact express@4.21.1
npm install --save-exact playwright@1.47.0

# Update package.json to use exact versions
"dependencies": {
  "n8n": "1.117.3",
  "playwright": "1.47.0",
  "express": "4.21.1",
  "axios": "1.12.0",
  "dotenv": "16.4.5"
}
```

### 2. Network Security Hardening

```bash
# Add to .env for production
N8N_SECURE_COOKIE=true
N8N_COOKIE_SAME_SITE=strict
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
N8N_BLOCK_ENV_ACCESS_IN_NODE=true
N8N_DISABLE_UI=false  # Keep false for development
N8N_ENCRYPTION_KEY=[STRONG-256-BIT-KEY]

# Network restrictions
N8N_HOST=127.0.0.1  # Localhost only
N8N_PORT=5678
N8N_PROTOCOL=https  # Force HTTPS in production
```

### 3. Dependency Management

```json
// Add to package.json
{
  "overrides": {
    "form-data": "^4.0.4",
    "axios": "^1.12.0",
    "semver": "^7.6.0",
    "validator": "^13.15.20",
    "nodemailer": "^7.0.7"
  },
  "resolutions": {
    "form-data": "^4.0.4",
    "axios": "^1.12.0"
  }
}
```

### 4. Runtime Security Controls

```javascript
// Add to index.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 5. Container Security (Recommended for Enterprise)

```dockerfile
# Dockerfile for secure deployment
FROM node:18-alpine AS base
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
USER node
EXPOSE 3000 5678
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### 6. Environment Isolation

```bash
# Production environment variables
NODE_ENV=production
NPM_CONFIG_AUDIT_LEVEL=moderate
NPM_CONFIG_FUND=false
NPM_CONFIG_UPDATE_NOTIFIER=false

# Security headers
FORCE_HTTPS=true
TRUST_PROXY=true
SESSION_SECRET=[STRONG-RANDOM-SECRET]
```

## 🛡️ Security Monitoring & Compliance

### 1. Automated Security Scanning

```bash
# Add to CI/CD pipeline
npm audit --audit-level moderate
npm outdated
snyk test  # If using Snyk
```

### 2. Data Sanitization Enhancement

```javascript
// Enhance scripts/data-sanitizer.js
class EnterpriseDataSanitizer extends DataSanitizer {
  sanitizeForEnterprise(workflowData) {
    const sanitized = super.sanitizeWorkflow(workflowData);

    // Additional enterprise rules
    this.removeSourceIPs(sanitized);
    this.sanitizeUserAgents(sanitized);
    this.removeDebugHeaders(sanitized);
    this.validateDataClassification(sanitized);

    return sanitized;
  }
}
```

### 3. Compliance Checklist

- [ ] **PCI DSS**: No credit card data in workflows
- [ ] **GDPR**: Personal data anonymization implemented
- [ ] **SOX**: Audit trails for financial workflows
- [ ] **HIPAA**: Healthcare data encryption (if applicable)
- [ ] **SOC2**: Access controls and monitoring

## 🚀 Deployment Strategy

### Development → Staging → Production Pipeline

1. **Development**: Current setup with auth disabled
2. **Staging**: Security hardened with test data
3. **Production**: Full enterprise security stack

### Production Checklist

- [ ] All vulnerabilities addressed
- [ ] HTTPS/TLS certificates configured
- [ ] WAF (Web Application Firewall) deployed
- [ ] Database encryption at rest
- [ ] Backup and disaster recovery tested
- [ ] Security incident response plan
- [ ] Regular penetration testing scheduled

## 🎯 Your Project's Enhanced Role

You're building a **secure enterprise wrapper** around n8n:

- **n8n handles**: Workflow execution, visual editor, node processing
- **Your security layer**: Data sanitization, access controls, audit trails
- **Enterprise integration**: Compliance, monitoring, incident response

The "wrapper architecture" provides **security benefits** - you can implement enterprise controls
without modifying n8n core! 🎉

```

When you ran `npm install`, it downloaded:

- **n8n version 1.117.3** (as noted in sessions.md)
- **2135 packages total** (massive dependency tree)
- All stored in `node_modules/` (which is .gitignored)

## 🏗️ Architecture Breakdown

**Your Project** = Wrapper/Dashboard around n8n:

```

Your Custom Code: ├── index.js # Express API server (port 3000) ├── scripts/data-sanitizer.js #
Security layer ├── playwright/jira-scraper.js # Web automation ├── configs/integrations.json #
Platform configs └── workflows/ # Your n8n workflow definitions

n8n Core (in node_modules/): ├── n8n/ # Complete n8n platform │ ├── packages/core/ # Core workflow
engine │ ├── packages/editor-ui/ # Web interface │ ├── packages/nodes-base/ # Built-in nodes │ └──
packages/cli/ # Command line interface

```

## 🚀 How It Works

1. **Command**: `npx n8n start` or `npm run n8n`
2. **Executes**: `node_modules/.bin/n8n` (installed via npm)
3. **Runs**: Full n8n platform from node_modules
4. **Serves**: Web UI at localhost:5678
5. **Uses**: Your `.env` config for settings

## 🎯 Your Project's Role

You're building a **dashboard/wrapper** around n8n:

- **n8n handles**: Workflow execution, visual editor, node processing
- **Your code handles**: API integration, data sanitization, security, custom logic
- **Integration point**: Your Express server (port 3000) + n8n server (port 5678)

This is actually a **smart architecture** - you get the full power of n8n without needing to
fork/modify their codebase, while adding your own security and integration layers on top.

The "no repo clone" approach means you're building **on top of** n8n rather than **modifying** n8n
itself! 🎉
```
