import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Power, Trash2, Settings } from 'lucide-react';

export default function PowerShellNodeMockup() {
  const [showPanel, setShowPanel] = useState(false);
  const [tab, setTab] = useState('config');
  const [active, setActive] = useState(true);
  const [nodeName, setNodeName] = useState('PowerShell Script');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState(
    `# Example PowerShell Script
Write-Host 'Hello World!'
Get-Process | Sort CPU -Descending | Select -First 5`
  );

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Node */}
      <motion.div
        layout
        onDoubleClick={() => setShowPanel(true)}
        whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
        className={`relative w-64 p-4 rounded-2xl bg-white border transition-all duration-300 cursor-pointer ${
          active ? 'border-blue-400 shadow-lg' : 'border-gray-200'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                active ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <h3 className="font-semibold text-gray-700">{nodeName}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setActive(!active);
              }}
              className="h-8 w-8"
            >
              <Power
                className={`w-4 h-4 ${active ? 'text-blue-500' : 'text-gray-500'}`}
              />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowPanel(true);
              }}
              className="h-8 w-8"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                alert('Node deleted');
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {description || 'Runs a custom PowerShell command.'}
        </p>
      </motion.div>

      {/* Slide-out configuration panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50"
            >
              <Card className="h-full rounded-none border-0 shadow-none">
                <CardHeader className="flex flex-row justify-between items-center px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-700">
                    PowerShell Configuration
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPanel(false)}
                    className="h-8 w-8"
                  >
                    <span className="text-xl">✕</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="h-full flex flex-col"
                  >
                    <TabsList className="border-b px-6 bg-gray-50 rounded-none w-full justify-start">
                      <TabsTrigger value="config">Configuration</TabsTrigger>
                      <TabsTrigger value="script">Script</TabsTrigger>
                      <TabsTrigger value="errors">Errors</TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="config"
                      className="p-6 space-y-4 overflow-auto flex-1"
                    >
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Node Name
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                          value={nodeName}
                          onChange={(e) => setNodeName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none resize-none"
                          placeholder="Describe what this node does..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Enabled
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => setActive(!active)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="script"
                      className="p-6 overflow-auto flex-1"
                    >
                      <label className="text-sm font-medium text-gray-700">
                        PowerShell Script
                      </label>
                      <textarea
                        className="mt-2 w-full bg-gray-900 text-green-400 font-mono text-xs rounded-xl p-4 h-64 overflow-auto resize-none outline-none focus:ring-2 focus:ring-blue-300"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                      />
                      <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Test Script
                      </Button>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <p className="font-semibold mb-1">💡 Tip:</p>
                        <p>
                          Use $input to access data from previous nodes. Results
                          are automatically JSON-serialized.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="errors"
                      className="p-6 overflow-auto flex-1"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Recent Errors
                      </p>
                      <div className="space-y-2">
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                          <p className="font-semibold text-xs text-red-600 mb-1">
                            [2025-11-03 17:42:31]
                          </p>
                          <p>Execution failed: Missing parameter `FilePath`.</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-3 text-sm">
                          <p className="font-semibold text-xs text-yellow-600 mb-1">
                            [2025-11-03 16:15:02]
                          </p>
                          <p>
                            Warning: Script execution took longer than 30
                            seconds.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => alert('Errors cleared')}
                      >
                        Clear Error Log
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
