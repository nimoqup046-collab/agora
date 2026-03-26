'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Dna, GitBranch, Zap, Activity, Database, ToggleLeft, ToggleRight, RefreshCw, History, ArrowUpRight } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import MemoryOrb from './MemoryOrb';

const initialNodes = [
  { id: 'v1', position: { x: 250, y: 50 }, data: { label: 'V1.0 (Base)' }, style: { background: '#10b981', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'v2', position: { x: 250, y: 200 }, data: { label: 'V1.2 (Optimized)' }, style: { background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'v3', position: { x: 100, y: 350 }, data: { label: 'V2.0-Alpha (Swarm)' }, style: { background: '#a855f7', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'v4', position: { x: 400, y: 350 }, data: { label: 'V2.0-Beta (Neural)' }, style: { background: '#f59e0b', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
];

const initialEdges = [
  { id: 'e1-2', source: 'v1', target: 'v2', animated: true },
  { id: 'e2-3', source: 'v2', target: 'v3', animated: true },
  { id: 'e2-4', source: 'v2', target: 'v4', animated: true },
];

export default function EvolutionMode() {
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
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold">L</div>
          <span className="font-mono text-2xl tracking-tight">AGORA</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-6 py-1.5 bg-white/10 backdrop-blur-xl rounded-3xl font-mono text-sm border border-emerald-400/30">EVOLUTION MODE</div>
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
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <Activity className="w-3 h-3" /> Genetic Status
              </h2>
              <div className="flex-1 space-y-4">
                <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 backdrop-blur-xl">
                  <div className="text-[10px] font-mono text-emerald-400 mb-2 uppercase tracking-widest">进化代数</div>
                  <div className="text-4xl font-mono font-bold text-white">GEN-42</div>
                  <div className="mt-4 flex gap-1">
                    {[1, 1, 1, 1, 0.6, 0.4, 0.2].map((v, i) => (
                      <div key={i} className="flex-1 h-8 bg-white/5 rounded-sm overflow-hidden relative">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${v * 100}%` }}
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4">核心突变率</div>
                  <div className="text-2xl font-mono font-bold text-white">0.024%</div>
                  <div className="mt-2 text-[10px] text-emerald-400/60 font-mono">稳定进化中...</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
              <div className="absolute top-8 left-8">
                <h2 className="font-mono text-xs flex items-center gap-2 text-emerald-400 uppercase tracking-widest">
                  <Dna className="w-4 h-4" /> DNA Helix Visualization
                </h2>
              </div>
              
              {/* 经典 DNA 螺旋动画 */}
              <div className="relative w-64 h-[400px] flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full flex justify-between items-center"
                    style={{ top: `${i * 8.33}%` }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-400/50 via-white/20 to-emerald-400/50 mx-2" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex gap-4">
                <button className="px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-mono text-xs flex items-center gap-2 transition-all">
                  <RefreshCw className="w-4 h-4" /> 触发突变
                </button>
                <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/60 font-mono text-xs flex items-center gap-2 transition-all">
                  <History className="w-4 h-4" /> 进化回溯
                </button>
              </div>
            </div>

            <div className="w-1/3 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-blue-400 mb-6 flex items-center gap-2 uppercase">
                <Database className="w-3 h-3" /> Evolution Log
              </h2>
              <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 p-6 font-mono text-[10px] text-zinc-500 space-y-4 overflow-auto custom-scrollbar">
                {[
                  { time: '12:04:22', event: '基因片段 A-12 发生置换', type: 'mutation' },
                  { time: '12:05:10', event: '环境适应度评估完成: 0.88', type: 'info' },
                  { time: '12:06:45', event: '新物种分支 B-04 形成', type: 'branch' },
                  { time: '12:08:12', event: '正在同步全球进化数据库...', type: 'sync' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-3 border-b border-white/5 pb-3">
                    <span className="text-zinc-600">[{log.time}]</span>
                    <span className={log.type === 'mutation' ? 'text-amber-400' : log.type === 'branch' ? 'text-emerald-400' : 'text-zinc-400'}>
                      {log.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ====================== ADVANCED VIEW ====================== */
          <>
            <div className="w-1/5 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <Activity className="w-3 h-3" /> Genetic Status
              </h2>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-emerald-400 mb-1 uppercase">当前代数</div>
                  <div className="text-2xl font-mono font-bold text-white">GEN-42</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-zinc-400">
                  突变率: 0.024%
                  <br />
                  适应度: 0.88
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md p-6">
              <h2 className="font-mono text-xs flex items-center gap-2 text-emerald-400 uppercase tracking-widest mb-4">
                <GitBranch className="w-4 h-4" /> Evolution Tree
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
                <Zap className="w-3 h-3" /> SOUL.md Configuration
              </h2>
              <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="markdown"
                  defaultValue={`# Evolution Configuration\n\n## Genetic Parameters\n- Mutation Rate: 0.024\n- Selection Pressure: 0.85\n- Population Size: 1024\n\n## Active Branches\n- Branch-A: [Stable]\n- Branch-B: [Mutating]\n\n## Evolution Strategy\n\`\`\`json\n{\n  "mode": "adaptive",\n  "target_fitness": 0.95\n}\n\`\`\``}
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

