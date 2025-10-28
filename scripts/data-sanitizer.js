/**
 * Data Sanitizer for n8n Workflows
 * Sanitizes sensitive data before enterprise deployment
 */

const crypto = require('crypto');

class DataSanitizer {
  constructor(encryptionKey) {
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY;
  }

  /**
   * Sanitize workflow data by removing/masking sensitive information
   */
  sanitizeWorkflow(workflowData) {
    const sanitized = JSON.parse(JSON.stringify(workflowData));
    
    // Remove sensitive credentials
    this.removeSensitiveCredentials(sanitized);
    
    // Mask personal information
    this.maskPersonalData(sanitized);
    
    // Remove development-specific configurations
    this.removeDevConfigs(sanitized);
    
    return sanitized;
  }

  removeSensitiveCredentials(data) {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'apiKey',
      'accessToken', 'refreshToken', 'privateKey'
    ];

    function traverse(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        } else if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        }
      }
    }

    traverse(data);
  }

  maskPersonalData(data) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;

    function maskString(str) {
      if (typeof str === 'string') {
        return str
          .replace(emailRegex, 'user@company.com')
          .replace(phoneRegex, 'XXX-XXX-XXXX');
      }
      return str;
    }

    function traverse(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        } else if (typeof obj[key] === 'string') {
          obj[key] = maskString(obj[key]);
        }
      }
    }

    traverse(data);
  }

  removeDevConfigs(data) {
    const devFields = ['debugMode', 'testEndpoint', 'localHost', 'devToken'];
    
    function traverse(obj) {
      for (const key in obj) {
        if (devFields.includes(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        }
      }
    }

    traverse(data);
  }

  /**
   * Validate workflow meets security standards
   */
  validateSecurity(workflowData) {
    const issues = [];

    // Check for hardcoded credentials
    const stringified = JSON.stringify(workflowData);
    if (stringified.includes('password:') || stringified.includes('token:')) {
      issues.push('Potential hardcoded credentials detected');
    }

    // Check for insecure HTTP endpoints
    if (stringified.includes('http://') && !stringified.includes('localhost')) {
      issues.push('Insecure HTTP endpoints detected');
    }

    // Check for personal information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    if (emailRegex.test(stringified)) {
      issues.push('Personal email addresses detected');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
}

module.exports = DataSanitizer;