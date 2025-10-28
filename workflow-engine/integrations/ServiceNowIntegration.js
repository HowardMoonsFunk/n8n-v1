/**
 * ServiceNow Integration Adapter
 * Handles ServiceNow API interactions for workflow nodes
 */

const axios = require('axios');

class ServiceNowIntegration {
  constructor(config = {}) {
    this.instanceUrl = config.instanceUrl || process.env.SERVICENOW_INSTANCE_URL;
    this.username = config.username || process.env.SERVICENOW_USERNAME;
    this.password = config.password || process.env.SERVICENOW_PASSWORD;
    this.authHeader = this.createAuthHeader();
  }

  createAuthHeader() {
    if (this.username && this.password) {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      return `Basic ${credentials}`;
    }
    return null;
  }

  /**
   * Get incidents
   */
  async getIncidents(options = {}) {
    const { limit = 100, offset = 0, state, priority, assignedTo, sysparmQuery } = options;

    let query = '';
    const filters = [];

    if (state) filters.push(`state=${state}`);
    if (priority) filters.push(`priority=${priority}`);
    if (assignedTo) filters.push(`assigned_to=${assignedTo}`);
    if (sysparmQuery) filters.push(sysparmQuery);

    if (filters.length > 0) {
      query = `?sysparm_query=${encodeURIComponent(filters.join('^'))}`;
    }

    const response = await axios.get(
      `${this.instanceUrl}/api/now/table/incident${query}&sysparm_limit=${limit}&sysparm_offset=${offset}`,
      {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
        },
      }
    );

    return {
      success: true,
      incidents: response.data.result.map((incident) => ({
        sysId: incident.sys_id,
        number: incident.number,
        shortDescription: incident.short_description,
        description: incident.description,
        state: incident.state,
        priority: incident.priority,
        severity: incident.severity,
        assignedTo: incident.assigned_to?.display_value || 'Unassigned',
        createdBy: incident.sys_created_by,
        createdOn: incident.sys_created_on,
        updatedOn: incident.sys_updated_on,
      })),
      total: response.headers['x-total-count'],
    };
  }

  /**
   * Create new incident
   */
  async createIncident(incidentData) {
    const {
      shortDescription,
      description,
      priority = 4,
      severity = 3,
      assignedTo,
      category,
      subcategory,
    } = incidentData;

    const payload = {
      short_description: shortDescription,
      description: description || '',
      priority: priority.toString(),
      severity: severity.toString(),
      ...(assignedTo && { assigned_to: assignedTo }),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
    };

    const response = await axios.post(`${this.instanceUrl}/api/now/table/incident`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      incident: {
        sysId: response.data.result.sys_id,
        number: response.data.result.number,
        shortDescription: response.data.result.short_description,
      },
    };
  }

  /**
   * Update incident
   */
  async updateIncident(sysId, updates) {
    const response = await axios.put(
      `${this.instanceUrl}/api/now/table/incident/${sysId}`,
      updates,
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
      incident: {
        sysId: response.data.result.sys_id,
        number: response.data.result.number,
      },
    };
  }

  /**
   * Get change requests
   */
  async getChangeRequests(options = {}) {
    const { limit = 100, offset = 0, state, priority } = options;

    let query = '';
    const filters = [];

    if (state) filters.push(`state=${state}`);
    if (priority) filters.push(`priority=${priority}`);

    if (filters.length > 0) {
      query = `?sysparm_query=${encodeURIComponent(filters.join('^'))}`;
    }

    const response = await axios.get(
      `${this.instanceUrl}/api/now/table/change_request${query}&sysparm_limit=${limit}&sysparm_offset=${offset}`,
      {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
        },
      }
    );

    return {
      success: true,
      changeRequests: response.data.result.map((change) => ({
        sysId: change.sys_id,
        number: change.number,
        shortDescription: change.short_description,
        description: change.description,
        state: change.state,
        priority: change.priority,
        risk: change.risk,
        assignedTo: change.assigned_to?.display_value || 'Unassigned',
        createdOn: change.sys_created_on,
        plannedStartDate: change.start_date,
        plannedEndDate: change.end_date,
      })),
      total: response.headers['x-total-count'],
    };
  }

  /**
   * Create change request
   */
  async createChangeRequest(changeData) {
    const {
      shortDescription,
      description,
      priority = 4,
      risk = 3,
      assignedTo,
      startDate,
      endDate,
      justification,
    } = changeData;

    const payload = {
      short_description: shortDescription,
      description: description || '',
      priority: priority.toString(),
      risk: risk.toString(),
      ...(assignedTo && { assigned_to: assignedTo }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(justification && { justification }),
    };

    const response = await axios.post(`${this.instanceUrl}/api/now/table/change_request`, payload, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      changeRequest: {
        sysId: response.data.result.sys_id,
        number: response.data.result.number,
        shortDescription: response.data.result.short_description,
      },
    };
  }

  /**
   * Get service catalog items
   */
  async getCatalogItems(options = {}) {
    const { limit = 100, category } = options;

    let url = `${this.instanceUrl}/api/sn_sc/servicecatalog/items`;
    if (category) {
      url += `/${category}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      params: { sysparm_limit: limit },
    });

    return {
      success: true,
      items: response.data.result.map((item) => ({
        sysId: item.sys_id,
        name: item.title || item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        available: item.active === 'true',
      })),
    };
  }

  /**
   * Submit service catalog request
   */
  async submitCatalogRequest(itemSysId, requestData) {
    const payload = {
      sysparm_item_guid: itemSysId,
      sysparm_quantity: requestData.quantity || 1,
      ...requestData.variables,
    };

    const response = await axios.post(
      `${this.instanceUrl}/api/sn_sc/servicecatalog/items/${itemSysId}/order_now`,
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
      request: {
        requestId: response.data.result.request_id,
        requestNumber: response.data.result.request_number,
      },
    };
  }

  /**
   * Get user information
   */
  async getUser(userId) {
    const response = await axios.get(`${this.instanceUrl}/api/now/table/sys_user/${userId}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    return {
      success: true,
      user: {
        sysId: response.data.result.sys_id,
        userName: response.data.result.user_name,
        firstName: response.data.result.first_name,
        lastName: response.data.result.last_name,
        email: response.data.result.email,
        department: response.data.result.department?.display_value,
        title: response.data.result.title,
      },
    };
  }
}

module.exports = ServiceNowIntegration;
