/**
 * Core Workflow Processor - Simplified Implementation
 * Handles if-then-else logic and basic workflow execution
 */

class WorkflowProcessor {
  constructor() {
    this.nodes = new Map();
    this.context = {};
  }

  /**
   * Load workflow from JSON definition
   */
  loadWorkflow(workflowJson) {
    this.workflow = workflowJson;
    this.nodes.clear();

    // Index nodes by ID for quick lookup
    workflowJson.nodes.forEach((node) => {
      this.nodes.set(node.id, node);
    });

    return this;
  }

  /**
   * Execute workflow starting from first node
   */
  async execute(initialData = {}) {
    console.log(`Executing workflow: ${this.workflow.name}`);

    this.context = {
      data: initialData,
      results: {},
      timestamp: new Date().toISOString(),
    };

    // Start with first node
    const startNode = this.workflow.nodes[0];
    return await this.executeNode(startNode.id);
  }

  /**
   * Execute a specific node and handle next steps
   */
  async executeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    console.log(`Executing node: ${nodeId} (${node.type})`);

    try {
      let result;

      // Execute based on node type
      switch (node.type) {
        case 'http':
          result = await this.executeHttpNode(node);
          break;
        case 'condition':
          result = await this.executeConditionNode(node);
          break;
        case 'action':
          result = await this.executeActionNode(node);
          break;
        case 'slack':
          result = await this.executeSlackNode(node);
          break;
        case 'jira':
          result = await this.executeJiraNode(node);
          break;
        case 'confluence':
          result = await this.executeConfluenceNode(node);
          break;
        case 'servicenow':
          result = await this.executeServiceNowNode(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Store result in context
      this.context.results[nodeId] = result;

      // Handle next node(s)
      if (result.nextNode) {
        return await this.executeNode(result.nextNode);
      } else if (result.nextNodes && result.nextNodes.length > 0) {
        // Execute multiple next nodes (parallel execution)
        const promises = result.nextNodes.map((id) => this.executeNode(id));
        return await Promise.all(promises);
      }

      return result;
    } catch (error) {
      console.error(`Error in node ${nodeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute HTTP request node
   */
  async executeHttpNode(node) {
    const axios = require('axios');

    const config = {
      method: node.method || 'GET',
      url: this.interpolate(node.url),
      headers: node.headers || {},
      timeout: 30000,
    };

    if (node.body) {
      config.data = this.interpolate(node.body);
    }

    const response = await axios(config);

    // Store response data in context
    this.context.data = {
      ...this.context.data,
      [node.id]: response.data,
    };

    return {
      success: true,
      data: response.data,
      nextNode: node.next,
    };
  }

  /**
   * Execute conditional logic node (if-then-else)
   */
  async executeConditionNode(node) {
    const expression = this.interpolate(node.expression);
    const result = this.evaluateCondition(expression);

    console.log(`Condition "${expression}" = ${result}`);

    return {
      success: true,
      conditionResult: result,
      nextNode: result ? node.onTrue : node.onFalse,
    };
  }

  /**
   * Execute action node (logging, data manipulation, etc.)
   */
  async executeActionNode(node) {
    switch (node.action) {
      case 'log':
        console.log(`Log: ${this.interpolate(node.message)}`);
        break;
      case 'set':
        this.context.data[node.key] = this.interpolate(node.value);
        break;
      default:
        console.log(`Action: ${node.action}`);
    }

    return {
      success: true,
      nextNode: node.next,
    };
  }

  /**
   * Interpolate variables in strings ({{variable}} syntax)
   */
  interpolate(str) {
    if (typeof str !== 'string') return str;

    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(this.context, path.trim());
      return value !== undefined ? value : match;
    });
  }

  /**
   * Get nested object value by path (e.g., "data.fetch.count")
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Evaluate simple conditional expressions
   * Supports: >, <, >=, <=, ==, !=
   */
  evaluateCondition(expression) {
    // Parse simple comparisons like "10 > 5" or "data.count >= 10"
    const operators = ['>=', '<=', '==', '!=', '>', '<'];

    for (const op of operators) {
      if (expression.includes(op)) {
        const [left, right] = expression.split(op).map((s) => s.trim());
        const leftVal = this.parseValue(left);
        const rightVal = this.parseValue(right);

        switch (op) {
          case '>':
            return leftVal > rightVal;
          case '<':
            return leftVal < rightVal;
          case '>=':
            return leftVal >= rightVal;
          case '<=':
            return leftVal <= rightVal;
          case '==':
            return leftVal == rightVal;
          case '!=':
            return leftVal != rightVal;
        }
      }
    }

    // If no operator found, treat as boolean
    return this.parseValue(expression);
  }

  /**
   * Parse value (number, string, or variable reference)
   */
  parseValue(str) {
    str = str.trim();

    // Check if it's a number
    if (!isNaN(str)) {
      return parseFloat(str);
    }

    // Check if it's a string literal
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }

    // Treat as variable path
    return this.getNestedValue(this.context, str);
  }

  /**
   * Execute Slack integration node
   */
  async executeSlackNode(node) {
    const SlackIntegration = require('../integrations/SlackIntegration');
    const slack = new SlackIntegration();

    let result;
    switch (node.action) {
      case 'sendMessage':
        const messageOptions = {
          channel: this.interpolate(node.config.channel),
          text: this.interpolate(node.config.text),
          username: node.config.username,
          icon_emoji: node.config.icon_emoji,
        };
        result = await slack.sendMessage(messageOptions);
        break;
      default:
        throw new Error(`Unknown Slack action: ${node.action}`);
    }

    this.context.data[node.id] = result.data;
    return {
      success: result.success,
      data: result.data,
      nextNode: node.next,
    };
  }

  /**
   * Execute Jira integration node
   */
  async executeJiraNode(node) {
    const JiraIntegration = require('../integrations/JiraIntegration');
    const jira = new JiraIntegration();

    let result;
    switch (node.action) {
      case 'searchIssues':
        result = await jira.searchIssues(this.interpolate(node.config.jql), node.config.options);
        break;
      case 'getIssue':
        result = await jira.getIssue(this.interpolate(node.config.issueKey));
        break;
      case 'createIssue':
        result = await jira.createIssue({
          project: this.interpolate(node.config.project),
          summary: this.interpolate(node.config.summary),
          description: this.interpolate(node.config.description),
          issueType: node.config.issueType,
          priority: node.config.priority,
        });
        break;
      default:
        throw new Error(`Unknown Jira action: ${node.action}`);
    }

    this.context.data[node.id] = result;
    return {
      success: result.success,
      data: result,
      nextNode: node.next,
    };
  }

  /**
   * Execute Confluence integration node
   */
  async executeConfluenceNode(node) {
    const ConfluenceIntegration = require('../integrations/ConfluenceIntegration');
    const confluence = new ConfluenceIntegration();

    let result;
    switch (node.action) {
      case 'searchContent':
        result = await confluence.searchContent(
          this.interpolate(node.config.query),
          node.config.options
        );
        break;
      case 'getPage':
        result = await confluence.getPage(this.interpolate(node.config.pageId));
        break;
      case 'createPage':
        result = await confluence.createPage({
          spaceKey: this.interpolate(node.config.spaceKey),
          title: this.interpolate(node.config.title),
          content: this.interpolate(node.config.content),
          parentId: node.config.parentId,
        });
        break;
      default:
        throw new Error(`Unknown Confluence action: ${node.action}`);
    }

    this.context.data[node.id] = result;
    return {
      success: result.success,
      data: result,
      nextNode: node.next,
    };
  }

  /**
   * Execute ServiceNow integration node
   */
  async executeServiceNowNode(node) {
    const ServiceNowIntegration = require('../integrations/ServiceNowIntegration');
    const serviceNow = new ServiceNowIntegration();

    let result;
    switch (node.action) {
      case 'getIncidents':
        result = await serviceNow.getIncidents(node.config);
        break;
      case 'createIncident':
        result = await serviceNow.createIncident({
          shortDescription: this.interpolate(node.config.shortDescription),
          description: this.interpolate(node.config.description),
          priority: node.config.priority,
          severity: node.config.severity,
          assignedTo: node.config.assignedTo,
        });
        break;
      case 'getChangeRequests':
        result = await serviceNow.getChangeRequests(node.config);
        break;
      default:
        throw new Error(`Unknown ServiceNow action: ${node.action}`);
    }

    this.context.data[node.id] = result;
    return {
      success: result.success,
      data: result,
      nextNode: node.next,
    };
  }
}

module.exports = WorkflowProcessor;
