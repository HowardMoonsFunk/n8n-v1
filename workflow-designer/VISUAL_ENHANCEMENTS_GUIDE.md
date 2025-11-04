# Visual Enhancement Implementation Guide

## Overview

This guide documents the architecture and implementation patterns used to create two interactive visual components:

1. **React Flow Workflow Designer** — A drag-and-drop node-based workflow canvas
2. **PowerShell Node Mockup** — An animated, configurable node with a slide-out panel

These patterns can be applied to any project requiring interactive, animated UI components.

---

## Table of Contents

1. [Tech Stack & Dependencies](#tech-stack--dependencies)
2. [Project Structure](#project-structure)
3. [React Flow Workflow Designer](#react-flow-workflow-designer)
4. [PowerShell Node Mockup](#powershell-node-mockup)
5. [shadcn/ui Component Library](#shadcnui-component-library)
6. [Animation Patterns with Framer Motion](#animation-patterns-with-framer-motion)
7. [Tailwind CSS Patterns](#tailwind-css-patterns)
8. [State Management Patterns](#state-management-patterns)
9. [Reusable Patterns for Other Projects](#reusable-patterns-for-other-projects)

---

## Tech Stack & Dependencies

### Core Libraries

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.4",           // Node-based UI
    "framer-motion": "^10.16.16",      // Animations
    "lucide-react": "^0.294.0",        // Icons
    "clsx": "^2.0.0",                  // Class name utility
    "tailwind-merge": "^2.2.0"         // Tailwind merge utility
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
```

### Why These Libraries?

- **React Flow**: Best-in-class library for node-based UIs (flowcharts, diagrams, workflows)
- **Framer Motion**: Declarative animations with spring physics and gesture support
- **Lucide React**: 1000+ open-source icons, tree-shakeable
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **Vite**: Fast build tool with HMR (Hot Module Replacement)

---

## Project Structure

```
workflow-designer/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── card.jsx
│   │   │   ├── button.jsx
│   │   │   └── tabs.jsx
│   │   ├── CustomNode.jsx         # React Flow custom node
│   │   └── PowerShellNodeMockup.jsx
│   ├── lib/
│   │   └── utils.js               # Utility functions
│   ├── App.jsx                    # Main workflow canvas
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.cjs
```

### Key Configuration Files

#### `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Enable @ imports
    },
  },
});
```

**Key Pattern**: The `@` alias lets you import with `@/components/ui/button` instead of `../../components/ui/button`.

#### `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Scan all source files
  ],
  theme: {
    extend: {},  // Add custom colors, fonts, etc.
  },
  plugins: [],
}
```

#### `postcss.config.cjs` (Note: .cjs for CommonJS)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Important**: Use `.cjs` extension when `package.json` has `"type": "module"`.

---

## React Flow Workflow Designer

### Core Concepts

React Flow provides:
- **Nodes**: Visual elements on the canvas
- **Edges**: Connections between nodes
- **Handles**: Connection points on nodes
- **Controls**: Zoom, fit view, etc.
- **MiniMap**: Overview of canvas
- **Background**: Grid or dots

### Step 1: Basic Setup

```jsx
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';  // Required styles

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}
```

### Step 2: Custom Node Component

```jsx
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id }) => {
  const [active, setActive] = useState(data.active ?? true);

  return (
    <div className="rounded-2xl shadow-lg border p-4 w-48 bg-white">
      {/* Input handle (left side) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-gray-400 !w-3 !h-3" 
      />

      {/* Node content */}
      <h4 className="font-semibold">{data.label}</h4>
      <p className="text-sm text-gray-500">{data.description}</p>
      
      {/* Output handle (right side) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gray-400 !w-3 !h-3" 
      />
    </div>
  );
};

// Register custom node type
const nodeTypes = { custom: CustomNode };

// Use in ReactFlow
<ReactFlow nodeTypes={nodeTypes} ... />
```

**Key Patterns**:
- `!bg-gray-400` — The `!` forces Tailwind to use `!important`
- `Handle` with `type="target"` = input, `type="source"` = output
- `Position.Left` / `Position.Right` controls handle placement

### Step 3: Node State Management

```jsx
const [nodes, setNodes, onNodesChange] = useNodesState([
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      label: 'HTTP Request',
      description: 'Make API calls',
      active: true,
      onDelete: handleDelete,  // Callback function
      onToggle: handleToggle,
    },
  },
]);

const handleDelete = useCallback((id) => {
  setNodes((nds) => nds.filter((n) => n.id !== id));
  setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
}, [setNodes, setEdges]);

const handleToggle = useCallback((id, active) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, active } }
        : node
    )
  );
}, [setNodes]);
```

**Key Pattern**: Pass callbacks through `data` prop to communicate from node to parent.

### Step 4: Adding Nodes Dynamically

```jsx
const [nodeIdCounter, setNodeIdCounter] = useState(4);

const addNode = useCallback((template) => {
  const newNode = {
    id: `${nodeIdCounter}`,
    type: 'custom',
    position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 },
    data: {
      label: template.label,
      description: template.description,
      active: true,
      onDelete: handleDelete,
      onToggle: handleToggle,
    },
  };
  setNodes((nds) => [...nds, newNode]);
  setNodeIdCounter((c) => c + 1);
}, [nodeIdCounter, handleDelete, handleToggle]);

// In UI
<button onClick={() => addNode(template)}>
  Add {template.label}
</button>
```

### Step 5: Styling Edges

```jsx
const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#888', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888',
    },
  },
];
```

### Step 6: MiniMap Customization

```jsx
<MiniMap
  nodeColor={(node) => (node.data.active ? '#86efac' : '#d1d5db')}
  maskColor="rgba(0, 0, 0, 0.1)"
/>
```

**Pattern**: `nodeColor` accepts a function that returns a color based on node state.

---

## PowerShell Node Mockup

### Architecture

The PowerShell node demonstrates:
1. **Hover animations** (scale, shadow)
2. **Slide-out panel** with spring physics
3. **Tabbed interface** for configuration
4. **Backdrop overlay** with click-outside-to-close
5. **Live state synchronization** between node and panel

### Step 1: Main Node Component

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Trash2, Settings } from 'lucide-react';

const [showPanel, setShowPanel] = useState(false);
const [active, setActive] = useState(true);

return (
  <motion.div
    layout
    onDoubleClick={() => setShowPanel(true)}
    whileHover={{ 
      scale: 1.03, 
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)' 
    }}
    className={`w-64 p-4 rounded-2xl bg-white border ${
      active ? 'border-blue-400' : 'border-gray-200'
    }`}
  >
    {/* Node content */}
  </motion.div>
);
```

**Key Patterns**:
- `layout` — Enables layout animations when size/position changes
- `whileHover` — Applies animation on hover (scale, shadow)
- `onDoubleClick` — Opens configuration panel

### Step 2: Animated Slide-Out Panel

```jsx
<AnimatePresence>
  {showPanel && (
    <>
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={() => setShowPanel(false)}
      />

      {/* Slide-out panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 25 
        }}
        className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50"
      >
        {/* Panel content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Key Patterns**:
- `AnimatePresence` — Required for exit animations
- `initial/animate/exit` — Define animation states
- `transition` with `spring` — Natural, physics-based motion
- `backdrop-blur-sm` — Tailwind blur effect
- `z-40` / `z-50` — Layer management (backdrop behind panel)

**Spring Physics Parameters**:
- `stiffness: 260` — How quickly spring responds (higher = faster)
- `damping: 25` — How much bounce (lower = more bounce)

### Step 3: Tabbed Interface

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

const [tab, setTab] = useState('config');

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="config">Configuration</TabsTrigger>
    <TabsTrigger value="script">Script</TabsTrigger>
    <TabsTrigger value="errors">Errors</TabsTrigger>
  </TabsList>

  <TabsContent value="config">
    {/* Configuration form */}
  </TabsContent>

  <TabsContent value="script">
    {/* Script editor */}
  </TabsContent>

  <TabsContent value="errors">
    {/* Error log */}
  </TabsContent>
</Tabs>
```

### Step 4: Live State Synchronization

```jsx
const [nodeName, setNodeName] = useState('PowerShell Script');

// In panel
<input
  value={nodeName}
  onChange={(e) => setNodeName(e.target.value)}
/>

// In node card (updates automatically)
<h3>{nodeName}</h3>
```

**Pattern**: Single source of truth in parent component, updates propagate to both node and panel.

### Step 5: Toggle Switch (Custom Tailwind)

```jsx
<label className="relative inline-flex items-center cursor-pointer">
  <input
    type="checkbox"
    checked={active}
    onChange={() => setActive(!active)}
    className="sr-only peer"
  />
  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
</label>
```

**Pattern Breakdown**:
- `sr-only` — Hides checkbox for accessibility (screen reader only)
- `peer` — Marks input for peer-based styling
- `peer-checked:` — Applies styles when checkbox is checked
- `after:` — Creates toggle knob with pseudo-element
- `peer-checked:after:translate-x-full` — Slides knob on check

---

## shadcn/ui Component Library

shadcn/ui is a collection of copy-paste components (not an npm package). You own the code.

### Setup Pattern

1. Create utility function:

```javascript
// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**What it does**: Merges Tailwind classes intelligently, resolving conflicts.

Example:
```javascript
cn('px-2 py-1', 'px-4')  // Result: 'py-1 px-4' (px-4 wins)
```

### Button Component

```jsx
// src/components/ui/button.jsx
import { cn } from "../../lib/utils";

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-200 bg-white hover:bg-gray-100",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
```

**Usage**:
```jsx
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
</Button>
```

### Card Component

```jsx
// src/components/ui/card.jsx
const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-xl border bg-white shadow",
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
```

**Pattern**: Each component is a wrapper around a `div` with pre-defined Tailwind classes, but allows override via `className`.

### Tabs Component

```jsx
// src/components/ui/tabs.jsx
const TabsContext = React.createContext({});

const Tabs = ({ value, onValueChange, children, ...props }) => (
  <div {...props}>
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  </div>
);

const TabsTrigger = ({ value, ...props }) => {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "px-3 py-1.5 text-sm rounded-sm",
        isActive
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      )}
      {...props}
    />
  );
};

const TabsContent = ({ value, ...props }) => {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;
  return <div {...props} />;
};
```

**Pattern**: Uses React Context to share active tab state between triggers and content.

---

## Animation Patterns with Framer Motion

### 1. Basic Fade In/Out

```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  Content
</motion.div>
```

### 2. Slide In from Right

```jsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
>
  Panel
</motion.div>
```

### 3. Scale on Hover

```jsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button
</motion.div>
```

### 4. Staggered List Animation

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### 5. Layout Animation (Auto-animate size/position changes)

```jsx
<motion.div layout>
  {expanded && <ExtraContent />}
</motion.div>
```

**Pro Tip**: Add `layoutId` to animate element between different positions:

```jsx
<motion.div layoutId="card-1">Card</motion.div>

// In another component
<motion.div layoutId="card-1">Card (moves smoothly)</motion.div>
```

---

## Tailwind CSS Patterns

### 1. Responsive Design

```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* 100% width mobile, 50% tablet, 33% desktop */}
</div>
```

### 2. Dark Mode

```jsx
<div className="bg-white dark:bg-gray-900">
  {/* Switches based on system preference */}
</div>
```

### 3. Group Hover

```jsx
<div className="group">
  <img className="group-hover:scale-110" />
  <p className="group-hover:text-blue-600">Hover me</p>
</div>
```

### 4. Peer States (Sibling)

```jsx
<input type="checkbox" className="peer" />
<div className="peer-checked:bg-blue-600">
  Turns blue when checkbox checked
</div>
```

### 5. Custom Gradients

```jsx
<div className="bg-gradient-to-br from-gray-50 to-gray-100">
  Gradient background
</div>
```

### 6. Backdrop Effects

```jsx
<div className="backdrop-blur-sm bg-black/20">
  Blurred overlay
</div>
```

`bg-black/20` = black at 20% opacity

### 7. Custom Animations

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

Use: `className="animate-pulse-slow"`

---

## State Management Patterns

### 1. Lifting State Up

```jsx
// Parent manages state
const [nodes, setNodes] = useState([]);

// Child receives via props
<CustomNode data={node.data} onUpdate={(newData) => updateNode(node.id, newData)} />
```

### 2. Context for Deep Nesting

```jsx
const ThemeContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DeepNestedComponent />
    </ThemeContext.Provider>
  );
}

function DeepNestedComponent() {
  const { theme } = useContext(ThemeContext);
  return <div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'} />;
}
```

### 3. Custom Hooks for Logic Reuse

```jsx
function useNodeState(initialNodes) {
  const [nodes, setNodes] = useState(initialNodes);

  const addNode = useCallback((node) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { nodes, addNode, deleteNode };
}

// Usage
const { nodes, addNode, deleteNode } = useNodeState(initialNodes);
```

---

## Reusable Patterns for Other Projects

### Pattern 1: Slide-Out Panel (Generic)

```jsx
function SlideOutPanel({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Usage
<SlideOutPanel isOpen={showPanel} onClose={() => setShowPanel(false)}>
  <h2>Panel Content</h2>
</SlideOutPanel>
```

### Pattern 2: Node Palette (Generic)

```jsx
function NodePalette({ templates, onAddNode }) {
  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="font-bold mb-4">Components</h2>
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onAddNode(template)}
          className="w-full text-left p-3 rounded-lg border hover:border-blue-400 hover:bg-blue-50"
        >
          <div className="font-medium">{template.label}</div>
          <div className="text-xs text-gray-500">{template.description}</div>
        </button>
      ))}
    </div>
  );
}
```

### Pattern 3: Animated Card Grid

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
  className="grid grid-cols-3 gap-4"
>
  {cards.map((card) => (
    <motion.div
      key={card.id}
      variants={item}
      whileHover={{ scale: 1.05 }}
      className="p-4 bg-white rounded-lg shadow"
    >
      {card.content}
    </motion.div>
  ))}
</motion.div>
```

### Pattern 4: Code Editor Component

```jsx
function CodeEditor({ value, onChange, language = 'javascript' }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-300"
      spellCheck="false"
    />
  );
}
```

**Pro Tip**: For production, use Monaco Editor (VS Code editor) or CodeMirror for syntax highlighting.

### Pattern 5: Status Indicator

```jsx
function StatusIndicator({ active }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-full transition-colors ${
          active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className="text-sm text-gray-600">
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
```

---

## Best Practices

### 1. Performance

- **Use `useCallback`** for event handlers passed to child components
- **Use `React.memo`** for components that re-render frequently
- **Use `useMemo`** for expensive calculations

```jsx
const MemoizedNode = React.memo(CustomNode);

const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### 2. Accessibility

- Always include `aria-label` for icon-only buttons:

```jsx
<button aria-label="Delete node">
  <Trash2 className="w-4 h-4" />
</button>
```

- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Ensure keyboard navigation works (Tab, Enter, Escape)

### 3. Animation Performance

- Animate `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `left`, `top` (causes reflow)

```jsx
// ✅ Good (transform)
<motion.div animate={{ x: 100 }} />

// ❌ Bad (left)
<motion.div animate={{ left: 100 }} />
```

### 4. Tailwind Best Practices

- Use `@apply` for repeated patterns:

```css
/* index.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }
}
```

- Extract components instead of repeating long class strings
- Use Tailwind's built-in utilities before creating custom CSS

---

## Common Pitfalls & Solutions

### Issue 1: Framer Motion exit animations not working

**Problem**: Component disappears immediately instead of animating out.

**Solution**: Wrap in `<AnimatePresence>`:

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div exit={{ opacity: 0 }}>
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### Issue 2: Tailwind classes not applying

**Problem**: Custom classes don't show up.

**Solution**: Check `tailwind.config.js` `content` array includes your files:

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",  // Must include all file types
]
```

### Issue 3: React Flow handles not connecting

**Problem**: Can't drag connections between nodes.

**Solution**: Ensure `Handle` has both `type` and `position`:

```jsx
<Handle type="source" position={Position.Right} />
<Handle type="target" position={Position.Left} />
```

### Issue 4: State updates not re-rendering component

**Problem**: Changing state doesn't update UI.

**Solution**: Don't mutate state directly, create new objects:

```jsx
// ❌ Wrong
nodes[0].data.label = 'New Label';
setNodes(nodes);

// ✅ Correct
setNodes(nodes.map(node => 
  node.id === '0' 
    ? { ...node, data: { ...node.data, label: 'New Label' } }
    : node
));
```

---

## Quick Start Checklist for New Projects

1. **Install dependencies**:
```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion lucide-react clsx tailwind-merge
npm install reactflow  # If using node-based UI
```

2. **Initialize Tailwind**:
```bash
npx tailwindcss init -p
```

3. **Configure Vite** (`vite.config.js`)
4. **Create `src/lib/utils.js`** with `cn` function
5. **Create `src/components/ui/`** folder for reusable components
6. **Add Tailwind directives** to `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

7. **Start building** components using patterns from this guide

---

## Resources

- **React Flow**: https://reactflow.dev/
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Lucide Icons**: https://lucide.dev/

---

## Summary

This implementation demonstrates:

✅ **Node-based UI** with React Flow  
✅ **Smooth animations** with Framer Motion spring physics  
✅ **Utility-first styling** with Tailwind CSS  
✅ **Reusable components** with shadcn/ui patterns  
✅ **State management** with React hooks  
✅ **Responsive design** and accessibility  

All patterns are production-ready and can be adapted to dashboard builders, form designers, flowchart tools, configuration panels, and any interactive UI requiring visual enhancements.
