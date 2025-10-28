/**
 * Express server for Custom Workflow Engine
 * Serves the web interface and provides REST API
 */

const express = require('express');
const path = require('path');
const WorkflowProcessor = require('./core/WorkflowProcessor');

const app = express();
const PORT = process.env.WORKFLOW_PORT || 8080;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'web')));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Custom Workflow Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Execute workflow endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { workflow, data = {} } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow definition is required',
      });
    }

    console.log(`Executing workflow: ${workflow.name || 'Unnamed'}`);

    // Create processor and execute workflow
    const processor = new WorkflowProcessor();
    processor.loadWorkflow(workflow);

    const result = await processor.execute(data);

    res.json({
      success: true,
      data: result,
      executionTime: new Date().toISOString(),
      workflowName: workflow.name,
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Validate workflow endpoint
app.post('/api/validate', (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({
        valid: false,
        errors: ['Workflow definition is required'],
      });
    }

    const errors = [];

    // Basic validation
    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have nodes array');
    } else {
      // Validate each node
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`Node at index ${index} missing id`);
        }
        if (!node.type) {
          errors.push(`Node ${node.id || index} missing type`);
        }
      });

      // Check for duplicate node IDs
      const nodeIds = workflow.nodes.map((n) => n.id).filter(Boolean);
      const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate node IDs: ${duplicates.join(', ')}`);
      }
    }

    res.json({
      valid: errors.length === 0,
      errors: errors,
    });
  } catch (error) {
    res.status(500).json({
      valid: false,
      errors: [error.message],
    });
  }
});

// Get example workflows
app.get('/api/examples', (req, res) => {
  const fs = require('fs');
  const examplesDir = path.join(__dirname, 'examples');

  try {
    const files = fs.readdirSync(examplesDir).filter((file) => file.endsWith('.json'));

    const examples = files.map((file) => {
      const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
      return {
        name: file.replace('.json', ''),
        workflow: JSON.parse(content),
      };
    });

    res.json({ examples });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load examples',
      message: error.message,
    });
  }
});

// Save workflow endpoint
app.post('/api/workflows', (req, res) => {
  const { workflow, name } = req.body;

  if (!workflow || !name) {
    return res.status(400).json({
      success: false,
      error: 'Workflow and name are required',
    });
  }

  try {
    const fs = require('fs');
    const workflowsDir = path.join(__dirname, 'workflows');

    // Create workflows directory if it doesn't exist
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    const filename = `${name.replace(/[^a-zA-Z0-9-]/g, '-')}.json`;
    const filepath = path.join(workflowsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));

    res.json({
      success: true,
      message: 'Workflow saved successfully',
      filename: filename,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save workflow',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Custom Workflow Engine running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Web interface: http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`  POST /api/execute - Execute workflow`);
  console.log(`  POST /api/validate - Validate workflow`);
  console.log(`  GET  /api/examples - Get example workflows`);
  console.log(`  POST /api/workflows - Save workflow`);
});

module.exports = app;
