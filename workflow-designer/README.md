# n8n-v1 Workflow Designer

A visual workflow designer built with React Flow, inspired by n8n's node-based automation interface.

## Features

- 🎨 **Drag & Drop**: Visual node-based workflow creation
- 🔗 **Connect Nodes**: Click and drag to create connections between nodes
- ⚡ **Toggle Activation**: Turn nodes on/off with a single click
- 🗑️ **Delete Nodes**: Remove nodes and their connections
- 📦 **Node Palette**: Pre-built node templates (HTTP, If/Else, Playwright, etc.)
- 📊 **Live Stats**: Real-time workflow statistics
- 🎯 **MiniMap**: Overview of your entire workflow
- 🎨 **Tailwind Styling**: Modern, responsive UI

## Quick Start

### Prerequisites

- Node.js 20+ (already installed via Homebrew)
- npm 10+

### Installation

```bash
cd workflow-designer
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The designer will open automatically at `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Adding Nodes

1. Click any node template in the left sidebar
2. Node appears on the canvas at a random position
3. Drag nodes to reposition them

### Connecting Nodes

1. Click and drag from the **right handle** (output) of a node
2. Drop on the **left handle** (input) of another node
3. Connection is created with animated flow

### Toggle Node State

- Click the **On/Off** button on any node
- Green = Active, Gray = Inactive
- Visual indicator (green dot) shows current state

### Delete Nodes

- Click the **✕** button in the top-right of any node
- Node and all its connections are removed

## Node Templates

- **HTTP Request**: Make API calls
- **If/Else**: Conditional branching logic
- **Set Variable**: Store and manage data
- **Function**: Run custom JavaScript code
- **Playwright Scraper**: Web scraping (integrates with repo's Playwright setup)
- **Email**: Send notifications

## Architecture

```
workflow-designer/
├── src/
│   ├── components/
│   │   └── CustomNode.jsx      # Reusable node component
│   ├── App.jsx                  # Main workflow canvas
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind styles
├── index.html                   # HTML entry
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind setup
├── postcss.config.js            # PostCSS for Tailwind
└── package.json                 # Dependencies
```

## Extending

### Add a New Node Type

1. Add template to `nodeTemplates` array in `App.jsx`:

```javascript
{
  label: 'My Custom Node',
  description: 'Does something cool',
  active: true
}
```

2. Optionally create a custom node component in `src/components/`

### Integrate with Backend

The workflow state can be exported and sent to the backend:

```javascript
const exportWorkflow = () => {
  const workflow = {
    nodes: nodes,
    edges: edges,
    metadata: {
      created: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  // Send to backend
  fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
};
```

## Tech Stack

- **React 18**: UI framework
- **React Flow 11**: Node-based UI library
- **Vite 5**: Fast build tool and dev server
- **Tailwind CSS 3**: Utility-first styling
- **PostCSS**: CSS processing

## Next Steps

- [ ] Add workflow save/load functionality
- [ ] Integrate with backend API (`/api/workflows`)
- [ ] Add node configuration panels
- [ ] Implement actual Playwright scraper execution
- [ ] Add workflow validation
- [ ] Export to n8n-compatible JSON format

## License

MIT
