const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'n8n-personal-dashboard'
  });
});

// Dashboard endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'n8n Personal Dashboard API',
    endpoints: {
      health: '/health',
      workflows: '/api/workflows',
      integrations: '/api/integrations'
    }
  });
});

// API routes for workflow management
app.get('/api/workflows', (req, res) => {
  res.json({
    message: 'Workflow management endpoint',
    note: 'Connect to n8n API for workflow operations'
  });
});

// API routes for integration status
app.get('/api/integrations', (req, res) => {
  res.json({
    slack: { status: 'configured', active: false },
    confluence: { status: 'configured', active: false },
    jira: { status: 'configured', active: false },
    servicenow: { status: 'configured', active: false }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`n8n Personal Dashboard server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
});