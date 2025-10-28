/**
 * Confluence Integration Adapter
 * Handles Confluence API interactions for workflow nodes
 */

const axios = require('axios');

class ConfluenceIntegration {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.CONFLUENCE_BASE_URL;
    this.username = config.username || process.env.CONFLUENCE_USERNAME;
    this.apiToken = config.apiToken || process.env.CONFLUENCE_API_TOKEN;
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
   * Search for content
   */
  async searchContent(query, options = {}) {
    const { limit = 25, start = 0, type = 'page' } = options;

    const params = {
      cql: `text ~ "${query}"${type ? ` AND type = ${type}` : ''}`,
      limit,
      start,
    };

    const response = await axios.get(`${this.baseUrl}/rest/api/search`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params,
    });

    return {
      success: true,
      results: response.data.results.map((item) => ({
        id: item.content.id,
        title: item.content.title,
        type: item.content.type,
        space: item.content.space.name,
        url: `${this.baseUrl}${item.content._links.webui}`,
        lastModified: item.content.version.when,
        excerpt: item.excerpt,
      })),
      total: response.data.totalSize,
      limit: response.data.limit,
      start: response.data.start,
    };
  }

  /**
   * Get page content by ID
   */
  async getPage(pageId, expand = 'body.storage,version,space') {
    const response = await axios.get(`${this.baseUrl}/rest/api/content/${pageId}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params: { expand },
    });

    const page = response.data;
    return {
      success: true,
      page: {
        id: page.id,
        title: page.title,
        type: page.type,
        space: page.space.name,
        spaceKey: page.space.key,
        content: page.body?.storage?.value || '',
        version: page.version.number,
        created: page.version.when,
        createdBy: page.version.by.displayName,
        url: `${this.baseUrl}${page._links.webui}`,
      },
    };
  }

  /**
   * Create new page
   */
  async createPage(pageData) {
    const { spaceKey, title, content, parentId } = pageData;

    const payload = {
      type: 'page',
      title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage',
        },
      },
      ...(parentId && { ancestors: [{ id: parentId }] }),
    };

    const response = await axios.post(`${this.baseUrl}/rest/api/content`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      pageId: response.data.id,
      title: response.data.title,
      url: `${this.baseUrl}${response.data._links.webui}`,
    };
  }

  /**
   * Update existing page
   */
  async updatePage(pageId, updates) {
    const { title, content, version } = updates;

    // Get current version if not provided
    let currentVersion = version;
    if (!currentVersion) {
      const currentPage = await this.getPage(pageId, 'version');
      currentVersion = currentPage.page.version;
    }

    const payload = {
      version: { number: currentVersion + 1 },
      title,
      type: 'page',
      body: {
        storage: {
          value: content,
          representation: 'storage',
        },
      },
    };

    const response = await axios.put(`${this.baseUrl}/rest/api/content/${pageId}`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      pageId: response.data.id,
      title: response.data.title,
      version: response.data.version.number,
      url: `${this.baseUrl}${response.data._links.webui}`,
    };
  }

  /**
   * Get space information
   */
  async getSpace(spaceKey) {
    const response = await axios.get(`${this.baseUrl}/rest/api/space/${spaceKey}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params: { expand: 'description.plain,homepage' },
    });

    const space = response.data;
    return {
      success: true,
      space: {
        key: space.key,
        name: space.name,
        description: space.description?.plain?.value || '',
        type: space.type,
        homepage: space.homepage?.title || '',
        url: `${this.baseUrl}${space._links.webui}`,
      },
    };
  }

  /**
   * List spaces
   */
  async listSpaces(options = {}) {
    const { limit = 25, start = 0, type = 'global' } = options;

    const response = await axios.get(`${this.baseUrl}/rest/api/space`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params: {
        limit,
        start,
        type,
      },
    });

    return {
      success: true,
      spaces: response.data.results.map((space) => ({
        key: space.key,
        name: space.name,
        type: space.type,
        url: `${this.baseUrl}${space._links.webui}`,
      })),
      total: response.data.size,
      limit: response.data.limit,
      start: response.data.start,
    };
  }

  /**
   * Get recent content updates
   */
  async getRecentUpdates(spaceKey, options = {}) {
    const { limit = 10, type = 'page' } = options;

    let cql = `type = ${type} AND lastModified >= -7d`;
    if (spaceKey) {
      cql += ` AND space = ${spaceKey}`;
    }
    cql += ' ORDER BY lastModified DESC';

    const params = {
      cql,
      limit,
    };

    const response = await axios.get(`${this.baseUrl}/rest/api/search`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params,
    });

    return {
      success: true,
      updates: response.data.results.map((item) => ({
        id: item.content.id,
        title: item.content.title,
        type: item.content.type,
        space: item.content.space.name,
        spaceKey: item.content.space.key,
        lastModified: item.content.version.when,
        modifiedBy: item.content.version.by.displayName,
        url: `${this.baseUrl}${item.content._links.webui}`,
      })),
    };
  }

  /**
   * Add comment to page
   */
  async addComment(pageId, comment) {
    const payload = {
      type: 'comment',
      container: { id: pageId },
      body: {
        storage: {
          value: comment,
          representation: 'storage',
        },
      },
    };

    const response = await axios.post(`${this.baseUrl}/rest/api/content`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      commentId: response.data.id,
      pageId,
    };
  }
}

module.exports = ConfluenceIntegration;
