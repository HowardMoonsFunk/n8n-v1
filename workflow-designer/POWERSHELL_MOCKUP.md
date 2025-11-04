# PowerShell Node Mockup

A fully interactive PowerShell node component with Framer Motion animations and shadcn/ui components.

## Features

- 🎨 **Animated Slide-out Panel**: Smooth spring animation for configuration panel
- ⚡ **Live State Management**: Real-time updates for node name, description, and script
- 🎯 **Tabbed Interface**: Configuration, Script Editor, and Error Log tabs
- 💻 **Code Editor**: Syntax-highlighted PowerShell script editor
- 🔄 **Toggle States**: Enable/disable node with animated indicator
- 🎭 **Hover Effects**: Scale and shadow animations on hover
- 📱 **Backdrop Blur**: Modern overlay with click-outside-to-close

## Quick Start

### Install Dependencies

```bash
cd workflow-designer
npm install
```

### Run PowerShell Mockup

```bash
npm run dev
```

Then navigate to `powershell.html` or run:

```bash
# Open the PowerShell mockup directly
open http://localhost:3001/powershell.html
```

### Run Workflow Designer

```bash
npm run dev
```

Opens the full React Flow workflow designer at `http://localhost:3001`

## Component Structure

```
workflow-designer/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── card.jsx           # shadcn/ui Card components
│   │   │   ├── button.jsx         # shadcn/ui Button component
│   │   │   └── tabs.jsx           # shadcn/ui Tabs components
│   │   ├── CustomNode.jsx         # React Flow node
│   │   └── PowerShellNodeMockup.jsx  # PowerShell mockup
│   ├── lib/
│   │   └── utils.js               # Tailwind merge utility
│   ├── App.jsx                     # Main workflow canvas
│   ├── main.jsx                    # Workflow designer entry
│   └── main-powershell.jsx        # PowerShell mockup entry
├── index.html                      # Workflow designer HTML
├── powershell.html                 # PowerShell mockup HTML
└── package.json
```

## Features Demo

### Node Card
- **Double-click** to open configuration panel
- **Power button** toggles node on/off
- **Settings button** opens configuration panel
- **Delete button** removes node
- **Status indicator** pulses when active

### Configuration Panel
- **Slide-in animation** from right with spring physics
- **Backdrop overlay** with blur effect
- **Click outside** to close panel
- **Close button** in header

### Tabs
1. **Configuration Tab**
   - Edit node name (live updates on card)
   - Add description (live updates on card)
   - Toggle switch for enable/disable

2. **Script Tab**
   - Code editor with dark theme
   - Editable PowerShell script
   - Test Script button
   - Helpful tip box

3. **Errors Tab**
   - Recent error log with timestamps
   - Color-coded severity (red = error, yellow = warning)
   - Clear Error Log button

## Technologies

- **React 18**: UI framework
- **Framer Motion 10**: Animation library
- **shadcn/ui**: Component library (Tailwind-based)
- **Lucide React**: Icon library
- **Tailwind CSS 3**: Styling
- **Vite 5**: Build tool

## Customization

### Change Node Colors

Edit `PowerShellNodeMockup.jsx`:

```jsx
className={`... ${
  active ? 'border-purple-400' : 'border-gray-200'  // Change blue to purple
}`}
```

### Add New Tabs

Add to `Tabs` component:

```jsx
<TabsTrigger value="advanced">Advanced</TabsTrigger>

<TabsContent value="advanced" className="p-6">
  {/* Your content */}
</TabsContent>
```

### Modify Animation

Change spring physics in `motion.div`:

```jsx
transition={{ 
  type: 'spring', 
  stiffness: 300,  // More stiff = faster
  damping: 30      // More damping = less bounce
}}
```

## Integration with React Flow

To use this as a React Flow node:

1. Import into `App.jsx`:
```javascript
import PowerShellNode from './components/PowerShellNodeMockup';
```

2. Add to node types:
```javascript
const nodeTypes = { 
  custom: CustomNode,
  powershell: PowerShellNode 
};
```

3. Add node to palette:
```javascript
{ label: 'PowerShell Script', type: 'powershell', ... }
```

## Next Steps

- [ ] Connect to backend API for script execution
- [ ] Add syntax highlighting with Monaco Editor
- [ ] Implement script validation
- [ ] Add variable autocomplete
- [ ] Save/load node configurations
- [ ] Add execution history
- [ ] Implement real PowerShell execution via backend

## License

MIT
