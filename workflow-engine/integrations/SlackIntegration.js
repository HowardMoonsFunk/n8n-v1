/**
 * Slack Integration Adapter
 * Handles Slack API interactions for workflow nodes
 */

const axios = require('axios');

class SlackIntegration {
  constructor(config = {}) {
    this.botToken = config.botToken || process.env.SLACK_BOT_TOKEN;
    this.webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;
    this.baseUrl = 'https://slack.com/api';
  }

  /**
   * Send message to Slack channel
   */
  async sendMessage(options) {
    const { channel, text, blocks, username, icon_emoji } = options;

    if (this.webhookUrl) {
      // Use webhook for simple messages
      return await this.sendWebhookMessage({ channel, text, username, icon_emoji });
    } else if (this.botToken) {
      // Use Bot API for advanced features
      return await this.sendBotMessage({ channel, text, blocks });
    } else {
      throw new Error('Slack bot token or webhook URL required');
    }
  }

  /**
   * Send message via webhook
   */
  async sendWebhookMessage(options) {
    const payload = {
      text: options.text,
      channel: options.channel,
      username: options.username || 'Workflow Bot',
      icon_emoji: options.icon_emoji || ':robot_face:',
    };

    const response = await axios.post(this.webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    return {
      success: response.data === 'ok',
      data: response.data,
    };
  }

  /**
   * Send message via Bot API
   */
  async sendBotMessage(options) {
    const payload = {
      channel: options.channel,
      text: options.text,
      blocks: options.blocks,
    };

    const response = await axios.post(`${this.baseUrl}/chat.postMessage`, payload, {
      headers: {
        Authorization: `Bearer ${this.botToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.data.ok,
      data: response.data,
      messageId: response.data.ts,
    };
  }

  /**
   * Get channel list
   */
  async getChannels() {
    if (!this.botToken) {
      throw new Error('Bot token required for channel list');
    }

    const response = await axios.get(`${this.baseUrl}/conversations.list`, {
      headers: { Authorization: `Bearer ${this.botToken}` },
    });

    return {
      success: response.data.ok,
      channels: response.data.channels || [],
    };
  }

  /**
   * Get user list
   */
  async getUsers() {
    if (!this.botToken) {
      throw new Error('Bot token required for user list');
    }

    const response = await axios.get(`${this.baseUrl}/users.list`, {
      headers: { Authorization: `Bearer ${this.botToken}` },
    });

    return {
      success: response.data.ok,
      users: response.data.members || [],
    };
  }

  /**
   * Create rich message blocks
   */
  createRichMessage(options) {
    const { title, text, color = '#36a64f', fields = [] } = options;

    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${title}*\n${text}`,
          },
        },
        ...(fields.length > 0
          ? [
              {
                type: 'section',
                fields: fields.map((field) => ({
                  type: 'mrkdwn',
                  text: `*${field.title}:*\n${field.value}`,
                })),
              },
            ]
          : []),
      ],
    };
  }
}

module.exports = SlackIntegration;
