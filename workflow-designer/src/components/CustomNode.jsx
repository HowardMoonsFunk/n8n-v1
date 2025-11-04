import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id }) => {
  const [active, setActive] = useState(data.active ?? true);

  const handleToggle = () => {
    setActive(!active);
    if (data.onToggle) {
      data.onToggle(id, !active);
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-lg border transition-all duration-300 p-4 w-48 bg-white hover:shadow-2xl hover:scale-[1.02] ${
        active ? 'border-green-400' : 'border-gray-300'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white" 
      />

      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-700 text-sm">{data.label}</h4>
        <button
          onClick={() => data.onDelete?.(id)}
          className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {data.description && (
        <p className="text-xs text-gray-500 mb-3">{data.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full transition-colors ${
              active ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></span>
          <span className="text-xs text-gray-600">
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
            active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {active ? 'On' : 'Off'}
        </button>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white" 
      />
    </div>
  );
};

export default CustomNode;
