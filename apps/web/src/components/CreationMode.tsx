'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Sparkles, Layout, Zap, Palette, Layers, ToggleLeft, ToggleRight, MousePointer2, Type, Image as ImageIcon, Box, ArrowRight, Play } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import MemoryOrb from './MemoryOrb';

const initialNodes = [
  { id: 'p', position: { x: 50, y: 200 }, data: { label: 'Prompt Input' }, style: { background: '#ec4899', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'e', position: { x: 300, y: 200 }, data: { label: 'Expansion Engine' }, style: { background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'r', position: { x: 550, y: 200 }, data: { label: 'Real-time Render' }, style: { background: '#10b981', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
];

const initialEdges = [
  { id: 'e-p-e', source: 'p', target: 'e', animated: true },
  { id: 'e-e-r', source: 'e', target: 'r', animated: true },
];

export default function CreationMode() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white relative overflow-hidden">
      <ParticlesBackground />

      {/* 顶部统一 Bar + 切换按钮 */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-black/70 backdrop-blur-2xl border-b border-white/10 flex items-center px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold">L</div>
          <span className="font-mono text-2xl tracking-tight">AGORA</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-6 py-1.5 bg-white/10 backdrop-blur-xl rounded-3xl font-mono text-sm border border-pink-400/30">CREATION MODE</div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdvanced(!isAdvanced)}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-3xl text-sm font-mono"
        >
          {isAdvanced ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{isAdvanced ? 'Advanced View' : 'Classic View'}</span>
        </motion.button>
      </div>

      <div className="pt-14 flex h-[calc(100vh-56px)]">
        {!isAdvanced ? (
          /* ====================== CLASSIC VIEW ====================== */
          <>
            <div className="w-1/4 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-pink-400 mb-6 flex items-center gap-2 uppercase">
                <Palette className="w-3 h-3" /> Tool Palette
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <MousePointer2 className="w-4 h-4" />, label: '选择' },
                  { icon: <Type className="w-4 h-4" />, label: '文本' },
                  { icon: <ImageIcon className="w-4 h-4" />, label: '素材' },
                  { icon: <Box className="w-4 h-4" />, label: '组件' },
                  { icon: <Layers className="w-4 h-4" />, label: '图层' },
                  { icon: <Sparkles className="w-4 h-4" />, label: 'AI 生成' }
                ].map((tool, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all"
                  >
                    <div className="text-pink-400">{tool.icon}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{tool.label}</div>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-auto p-6 bg-pink-500/10 rounded-3xl border border-pink-500/20 backdrop-blur-xl">
                <div className="text-[10px] font-mono text-pink-400 mb-2 uppercase tracking-widest">渲染进度</div>
                <div className="text-2xl font-mono font-bold text-white">READY</div>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col">
              <h2 className="font-mono text-xs flex items-center gap-2 text-pink-400 uppercase tracking-widest mb-6">
                <Layout className="w-4 h-4" /> Creation Canvas
              </h2>
              <div className="flex-1 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                {/* 网格背景 */}
                <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-3/4 h-3/4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-3xl border border-white/20 flex items-center justify-center relative group-hover:border-pink-500/40 transition-all"
                  >
                    <Sparkles className="w-12 h-12 text-pink-400/40 animate-pulse" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white">Untitled_Creation_01</div>
                        <div className="text-[10px] font-mono text-zinc-500">1920 x 1080 • 300 DPI</div>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-pink-400 hover:border-pink-400 transition-all cursor-pointer">
                        <Zap className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="w-1/4 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-purple-400 mb-6 flex items-center gap-2 uppercase">
                <Layers className="w-3 h-3" /> Properties
              </h2>
              <div className="space-y-6">
                {[
                  { label: '不透明度', value: '100%' },
                  { label: '混合模式', value: '正常' },
                  { label: '填充颜色', value: '#FF007A' },
                  { label: '描边', value: '2px' }
                ].map((prop, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <span>{prop.label}</span>
                      <span className="text-white">{prop.value}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full">
                      <div className="h-full bg-purple-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ====================== ADVANCED VIEW ====================== */
          <>
            <div className="w-1/5 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-pink-400 mb-6 flex items-center gap-2 uppercase">
                <Sparkles className="w-3 h-3" /> Creation Forge
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                  <div className="text-[10px] font-mono text-pink-400 mb-1 uppercase">渲染质量</div>
                  <div className="text-2xl font-mono font-bold text-white">ULTRA</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-zinc-400">
                  风格预设: Neo-DeepMind Cyber
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md p-6">
              <h2 className="font-mono text-xs flex items-center gap-2 text-pink-400 uppercase tracking-widest mb-4">
                <Layers className="w-4 h-4" /> Creation Workflow
              </h2>
              <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  className="h-full"
                >
                  <Background variant="dots" gap={20} size={1} color="#333" />
                  <Controls />
                </ReactFlow>
              </div>
            </div>

            <div className="w-1/2 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-blue-400 mb-6 flex items-center gap-2 uppercase">
                <ArrowRight className="w-3 h-3" /> Creation Editor
              </h2>
              <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="markdown"
                  defaultValue={`# Creation Prompt\n\n## Concept\nA futuristic neural network visualization inspired by DeepMind's latest aesthetic.\n\n## Visual Style\n- Deep space black background\n- Neon cyan and purple particles\n- Glassmorphism UI elements\n- Smooth Framer Motion transitions\n\n## Technical Requirements\n- React + Tailwind CSS\n- Lucide Icons\n- Responsive Layout`}
                  theme="vs-dark"
                  options={{ 
                    minimap: { enabled: true }, 
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono',
                    padding: { top: 20, bottom: 20 }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <MemoryOrb />
    </div>
  );
}

