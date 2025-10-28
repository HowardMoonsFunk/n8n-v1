# n8n Personal Dashboard

A comprehensive personal dashboard built with n8n for workflow automation, integrating multiple data sources including Slack, Confluence, Jira, and ServiceNow.

## Overview

This project creates a unified dashboard that:
- Ingests data from multiple sources (Slack, Confluence, Jira, ServiceNow)
- Supports drag-and-drop workflow creation with branching logic
- Uses Playwright for web scraping when APIs aren't available
- Tests workflows off-domain before publishing secure enterprise versions

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- n8n account (optional for cloud features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configurations
```

3. Start n8n:
```bash
npm run n8n
```

4. Access the n8n interface at `http://localhost:5678`

## Project Structure

```
├── .github/
│   └── copilot-instructions.md    # AI coding assistant instructions
├── workflows/                     # n8n workflow definitions
│   ├── slack-integration/
│   ├── confluence-sync/
│   ├── jira-tickets/
│   └── servicenow-incidents/
├── scripts/                       # Custom automation scripts
│   ├── data-sanitizer.js
│   └── workflow-validator.js
├── configs/                       # Configuration files
│   ├── integrations.json
│   └── security-policies.json
├── playwright/                    # Browser automation scripts
│   ├── scrapers/
│   └── tests/
├── docs/                         # Documentation
└── dashboard/                    # Custom dashboard components
```

## Key Features

### Data Source Integrations
- **Slack**: Team communication and notification workflows
- **Confluence**: Documentation and knowledge base access
- **Jira**: Issue tracking and project management data
- **ServiceNow**: IT service management integration

### Automation Capabilities
- Drag-and-drop workflow creation
- Branching logic with IF, Switch, Merge nodes
- Error handling and trigger management
- Playwright-based web scraping for non-API sources

### Security & Testing
- Off-domain workflow testing environment
- Data sanitization before enterprise deployment
- Secure credential management
- Workflow validation and compliance checks

## Development Workflow

1. Create workflows in n8n visual editor
2. Test in isolated development environment
3. Validate data sanitization
4. Deploy to secure enterprise environment

## API References

- [n8n Documentation](https://docs.n8n.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Integration Templates](https://n8nresources.dev/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test workflows thoroughly
4. Submit pull request with security review

## License

MIT License - see LICENSE file for details