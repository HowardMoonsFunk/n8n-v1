/**
 * Simple test runner for the workflow engine
 */

const WorkflowProcessor = require('./core/WorkflowProcessor');
const fs = require('fs');
const path = require('path');

async function testWorkflow() {
  console.log('🚀 Testing Custom Workflow Engine\n');

  // Load example workflow
  const workflowPath = path.join(__dirname, 'examples', 'jira-alert.json');
  const workflowJson = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

  // Create processor and load workflow
  const processor = new WorkflowProcessor();
  processor.loadWorkflow(workflowJson);

  // Mock data for testing (simulate Jira API response)
  const mockData = {
    JIRA_TOKEN: 'test-token-123',
  };

  try {
    // Execute workflow
    const result = await processor.execute(mockData);
    console.log('\n✅ Workflow completed successfully!');
    console.log('Final result:', result);
  } catch (error) {
    console.error('\n❌ Workflow execution failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testWorkflow();
}

module.exports = { testWorkflow };
