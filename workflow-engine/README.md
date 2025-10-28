# Simplified Custom Workflow Engine

## 🎯 Focused Implementation Plan

### Reorganized Phases (Simplified)

**Phase 1 (Week 1-2): Core Engine + Basic Web Interface**

- Core if-then-else logic processor
- JSON workflow definitions
- Simple web interface for testing
- Basic HTTP request capabilities

**Phase 2 (Week 3-4): Integration Layer**

- Platform connectors (Slack, Jira, Confluence, ServiceNow)
- Credential management
- Data sanitization integration

## 🏗️ Simplified Architecture

```
workflow-engine/
├── core/                        # Core execution engine
│   ├── WorkflowProcessor.js     # Main processor
│   ├── ConditionalLogic.js      # If-then-else logic
│   └── DataContext.js          # Data handling
├── nodes/                       # Node definitions
│   ├── BaseNode.js             # Node base class
│   ├── ConditionNode.js        # If-then-else nodes
│   ├── HttpNode.js             # HTTP request nodes
│   └── ActionNode.js           # Action nodes
├── web/                        # Simple web interface
│   ├── index.html             # Basic UI
│   ├── workflow-builder.js    # Simple builder
│   └── api.js                 # REST endpoints
└── examples/                   # Sample workflows
    └── jira-alert.json        # Example workflow
```

## 🚀 Phase 1 Implementation

### Core Features:

1. **JSON Workflow Format**: Simple, readable definitions
2. **If-Then-Else Processing**: Core conditional logic
3. **HTTP Requests**: Basic integration capability
4. **Web Interface**: Simple form-based workflow creation
5. **Local Testing**: Run workflows immediately

## 📦 Dependencies (documented)

Server/runtime (Node.js):

- express (API + static hosting)
- axios (HTTP client for nodes)

Web UI (no bundler):

- react 18 (vendored UMD)
- react-dom 18 (vendored UMD)
- reactflow 11 (vendored UMD + CSS)
- @babel/standalone (vendored, in-browser JSX transform)

Styling:

- Tailwind CSS via CDN for now (can be vendored if offline-only is required)

## 🗂️ Local, vendored browser assets

To avoid CDNs and enable offline/locked-down environments, the UI loads all browser libraries from
local files served by the app:

```
workflow-engine/web/vendor/
├── react.production.min.js
├── react-dom.production.min.js
├── reactflow.umd.js
├── reactflow-style.css
└── babel.min.js
```

The Visual Builder page `web/builder2.html` references the files above and compiles JSX in the
browser using Babel Standalone (no build step). Tailwind is currently served from the CDN; switch to
a local stylesheet or a vendored Tailwind build if external access is not permitted.

### Example Workflow (JSON):

```json
{
  "name": "Simple Jira Alert",
  "nodes": [
    {
      "id": "fetch",
      "type": "http",
      "method": "GET",
      "url": "https://jira.company.com/api/tickets",
      "next": "check"
    },
    {
      "id": "check",
      "type": "condition",
      "expression": "data.count > 10",
      "onTrue": "alert",
      "onFalse": "done"
    },
    {
      "id": "alert",
      "type": "http",
      "method": "POST",
      "url": "https://slack.com/webhook",
      "body": "High ticket count: {{data.count}}"
    }
  ]
}
```

## 📁 Project Structure

```
n8n-v1/                        # Main project
├── workflow-engine/           # NEW: Custom workflow solution
│   ├── core/                 # Core engine components
│   ├── nodes/                # Node type definitions
│   ├── web/                  # Simple web interface
│   └── examples/             # Sample workflows
├── scripts/                  # Existing security scripts
│   └── data-sanitizer.js    # Reuse existing sanitization
├── configs/                  # Configuration files
└── docs/                    # Documentation
```

This simplified approach focuses on your specific needs:

- ✅ **Fast implementation**: Core functionality in 1-2 weeks
- ✅ **Immediate testing**: Simple web interface from day 1
- ✅ **Reuse existing work**: Integrate current security scripts
- ✅ **Company approved**: Only internal dependencies
