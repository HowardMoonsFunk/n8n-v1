const { chromium } = require('playwright');

/**
 * Playwright scraper for Jira when API access is limited
 */
class JiraScraper {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.JIRA_BASE_URL;
    this.username = config.username || process.env.JIRA_USERNAME;
    this.password = config.password || process.env.JIRA_PASSWORD;
    this.headless = config.headless !== false;
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: this.headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async login() {
    await this.page.goto(`${this.baseUrl}/login`);
    
    // Handle Atlassian login flow
    await this.page.fill('#username', this.username);
    await this.page.click('#login-submit');
    
    // Wait for password field (Atlassian's two-step login)
    await this.page.waitForSelector('#password', { timeout: 10000 });
    await this.page.fill('#password', this.password);
    await this.page.click('#login-submit');
    
    // Wait for dashboard to load
    await this.page.waitForSelector('.dashboard', { timeout: 15000 });
  }

  async scrapeTicketData(ticketKey) {
    const ticketUrl = `${this.baseUrl}/browse/${ticketKey}`;
    await this.page.goto(ticketUrl);
    
    // Wait for ticket details to load
    await this.page.waitForSelector('#summary-val', { timeout: 10000 });
    
    const ticketData = await this.page.evaluate(() => {
      return {
        summary: document.querySelector('#summary-val')?.textContent?.trim(),
        status: document.querySelector('#status-val')?.textContent?.trim(),
        assignee: document.querySelector('#assignee-val')?.textContent?.trim(),
        priority: document.querySelector('#priority-val')?.textContent?.trim(),
        description: document.querySelector('#description-val')?.textContent?.trim(),
        created: document.querySelector('.created-date')?.textContent?.trim(),
        updated: document.querySelector('.updated-date')?.textContent?.trim()
      };
    });
    
    return ticketData;
  }

  async scrapeProjectTickets(projectKey, maxTickets = 50) {
    const searchUrl = `${this.baseUrl}/issues/?jql=project=${projectKey}&maxResults=${maxTickets}`;
    await this.page.goto(searchUrl);
    
    // Wait for search results
    await this.page.waitForSelector('.issue-list', { timeout: 10000 });
    
    const tickets = await this.page.evaluate(() => {
      const ticketRows = document.querySelectorAll('.issue-list .issue-row');
      return Array.from(ticketRows).map(row => ({
        key: row.querySelector('.issue-key')?.textContent?.trim(),
        summary: row.querySelector('.summary')?.textContent?.trim(),
        status: row.querySelector('.status')?.textContent?.trim(),
        assignee: row.querySelector('.assignee')?.textContent?.trim(),
        priority: row.querySelector('.priority')?.textContent?.trim()
      }));
    });
    
    return tickets;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = JiraScraper;