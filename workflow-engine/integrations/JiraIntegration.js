/**
 * Jira Integration Adapter
 * Handles Jira API interactions for workflow nodes
 */

const axios = require('axios');

class JiraIntegration {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.JIRA_BASE_URL;
    this.username = config.username || process.env.JIRA_USERNAME;
    this.apiToken = config.apiToken || process.env.JIRA_API_TOKEN;
    this.authHeader = this.createAuthHeader();
  }

  createAuthHeader() {
    if (this.username && this.apiToken) {
      const credentials = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64');
      return `Basic ${credentials}`;
    }
    return null;
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(jql, options = {}) {
    const {
      maxResults = 50,
      startAt = 0,
      fields = ['summary', 'status', 'assignee', 'priority'],
    } = options;

    const params = {
      jql,
      maxResults,
      startAt,
      fields: fields.join(','),
    };

    const response = await axios.get(`${this.baseUrl}/rest/api/2/search`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params,
    });

    return {
      success: true,
      total: response.data.total,
      issues: response.data.issues,
      maxResults: response.data.maxResults,
      startAt: response.data.startAt,
    };
  }

  /**
   * Get issue details by key
   */
  async getIssue(issueKey) {
    const response = await axios.get(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    const issue = response.data;
    return {
      success: true,
      issue: {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
        priority: issue.fields.priority ? issue.fields.priority.name : 'None',
        description: issue.fields.description,
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: issue.fields.project.key,
      },
    };
  }

  /**
   * Create new issue
   */
  async createIssue(issueData) {
    const { project, issueType = 'Task', summary, description, assignee, priority } = issueData;

    const payload = {
      fields: {
        project: { key: project },
        issuetype: { name: issueType },
        summary,
        description: description || '',
        ...(assignee && { assignee: { name: assignee } }),
        ...(priority && { priority: { name: priority } }),
      },
    };

    const response = await axios.post(`${this.baseUrl}/rest/api/2/issue`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      issueKey: response.data.key,
      issueId: response.data.id,
      selfUrl: response.data.self,
    };
  }

  /**
   * Update issue
   */
  async updateIssue(issueKey, updates) {
    const { summary, description, assignee, priority } = updates;

    const payload = {
      fields: {
        ...(summary && { summary }),
        ...(description && { description }),
        ...(assignee && { assignee: { name: assignee } }),
        ...(priority && { priority: { name: priority } }),
      },
    };

    await axios.put(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return { success: true, issueKey };
  }

  /**
   * Transition issue (change status)
   */
  async transitionIssue(issueKey, transitionId) {
    const payload = {
      transition: { id: transitionId },
    };

    await axios.post(`${this.baseUrl}/rest/api/2/issue/${issueKey}/transitions`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return { success: true, issueKey, transitionId };
  }

  /**
   * Get available transitions for issue
   */
  async getTransitions(issueKey) {
    const response = await axios.get(`${this.baseUrl}/rest/api/2/issue/${issueKey}/transitions`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    return {
      success: true,
      transitions: response.data.transitions.map((t) => ({
        id: t.id,
        name: t.name,
        to: t.to.name,
      })),
    };
  }

  /**
   * Add comment to issue
   */
  async addComment(issueKey, comment) {
    const payload = {
      body: comment,
    };

    const response = await axios.post(
      `${this.baseUrl}/rest/api/2/issue/${issueKey}/comment`,
      payload,
      {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      commentId: response.data.id,
      issueKey,
    };
  }

  /**
   * Get project information
   */
  async getProject(projectKey) {
    const response = await axios.get(`${this.baseUrl}/rest/api/2/project/${projectKey}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    return {
      success: true,
      project: {
        key: response.data.key,
        name: response.data.name,
        description: response.data.description,
        lead: response.data.lead.displayName,
        issueTypes: response.data.issueTypes.map((t) => ({ id: t.id, name: t.name })),
      },
    };
  }
}

module.exports = JiraIntegration;
