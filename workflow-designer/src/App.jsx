import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './components/CustomNode';
import PowerShellNode from './components/PowerShellNode';

const nodeTypes = { 
  custom: CustomNode,
  powershell: PowerShellNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      label: 'HTTP Trigger',
      description: 'Starts workflow on HTTP request',
      active: true,
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 100 },
    data: {
      label: 'Webhook',
      description: 'Receives webhook data',
      active: false,
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 700, y: 100 },
    data: {
      label: 'Data Transform',
      description: 'Process and filter data',
      active: true,
    },
  },
];

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
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: false,
    style: { stroke: '#888', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888',
    },
  },
];

const nodeTemplates = [
  { label: 'HTTP Request', description: 'Make HTTP API calls', active: true, type: 'custom' },
  { label: 'PowerShell Script', description: 'Run PowerShell commands', active: true, type: 'powershell' },
  { label: 'If/Else', description: 'Conditional branching', active: true, type: 'custom' },
  { label: 'Set Variable', description: 'Store data', active: true, type: 'custom' },
  { label: 'Function', description: 'Run custom code', active: true, type: 'custom' },
  { label: 'Playwright Scraper', description: 'Web scraping node', active: true, type: 'custom' },
  { label: 'Email', description: 'Send email notifications', active: true, type: 'custom' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(4);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#888', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#888',
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleDelete = useCallback(
    (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  const handleToggle = useCallback(
    (id, active) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, active } }
            : node
        )
      );
    },
    [setNodes]
  );

  const addNode = useCallback(
    (template) => {
      const newNode = {
        id: `${nodeIdCounter}`,
        type: template.type || 'custom',
        position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 },
        data: {
          label: template.label,
          description: template.description,
          active: template.active,
          onDelete: handleDelete,
          onToggle: handleToggle,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setNodeIdCounter((c) => c + 1);
    },
    [nodeIdCounter, setNodes, handleDelete, handleToggle]
  );

  // Update existing nodes with callbacks
  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: handleDelete,
      onToggle: handleToggle,
    },
  }));

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Node Palette</h2>
        <p className="text-xs text-gray-500 mb-4">
          Click to add nodes to the canvas
        </p>
        <div className="space-y-2">
          {nodeTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => addNode(template)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="font-medium text-gray-700 text-sm group-hover:text-blue-600">
                {template.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {template.description}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Workflow Stats
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Nodes: {nodes.length}</div>
            <div>Connections: {edges.length}</div>
            <div>
              Active: {nodes.filter((n) => n.data.active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10">
          <h1 className="text-xl font-bold text-gray-800">
            n8n-v1 Workflow Designer
          </h1>
          <p className="text-xs text-gray-500">
            Drag to connect nodes • Click nodes to toggle
          </p>
        </div>

        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#888', strokeWidth: 2 },
          }}
        >
          <MiniMap
            nodeColor={(node) => (node.data.active ? '#86efac' : '#d1d5db')}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Controls />
          <Background gap={16} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
