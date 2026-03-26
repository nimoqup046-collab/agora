'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { BrainCircuit, ArrowRight, Zap, Shield, HelpCircle, ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle, Scale, FileCode } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import MemoryOrb from './MemoryOrb';

const initialNodes = [
  { id: 'q', position: { x: 100, y: 200 }, data: { label: '核心问题' }, style: { background: '#06b6d4', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'b1', position: { x: 400, y: 100 }, data: { label: '逻辑分支 A' }, style: { background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'b2', position: { x: 400, y: 300 }, data: { label: '逻辑分支 B' }, style: { background: '#a855f7', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
];

const initialEdges = [
  { id: 'e1', source: 'q', target: 'b1', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e2', source: 'q', target: 'b2', animated: true, style: { stroke: '#06b6d4' } },
];

export default function ReasoningMode() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [confidence, setConfidence] = useState(94.2);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white relative overflow-hidden">
      <ParticlesBackground />

      {/* 顶部 Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-2xl border-b border-white/10 flex items-center px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">L</div>
          <span className="font-mono text-2xl tracking-tight">AGORA</span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="px-8 py-1.5 bg-white/10 backdrop-blur-xl rounded-3xl font-mono text-sm border border-cyan-400/30">REASONING MODE</div>
        </div>

        {/* 切换按钮 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdvanced(!isAdvanced)}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-3xl text-sm font-mono"
        >
          {isAdvanced ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{isAdvanced ? 'Advanced Logic View' : 'Classic View'}</span>
        </motion.button>
      </div>

      <div className="pt-14 flex h-[calc(100vh-56px)]">
        {!isAdvanced ? (
          /* ====================== CLASSIC VIEW ====================== */
          <div className="flex w-full">
            <div className="w-80 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-mono text-xs tracking-[2px] text-cyan-400 flex items-center gap-2 uppercase">
                  <BrainCircuit className="w-3 h-3" /> Reasoning Engine
                </h2>
                <div className="flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-6 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 backdrop-blur-xl">
                  <div className="text-[10px] font-mono text-cyan-400 mb-2 uppercase tracking-widest">置信度指数</div>
                  <div className="text-4xl font-mono font-bold text-white">{confidence}%</div>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      className="h-full bg-cyan-500"
                    />
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4">活跃辩论状态</div>
                  <div className="space-y-3">
                    {[
                      { agent: 'Agent-7', status: '提出反例', color: 'text-amber-400' },
                      { agent: 'Agent-3', status: '验证边界', color: 'text-blue-400' },
                      { agent: 'Agent-9', status: '逻辑闭环', color: 'text-emerald-400' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">{item.agent}</span>
                        <span className={item.color}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col relative">
              <div className="p-8 flex-1 flex flex-col">
                <h2 className="font-mono text-xs flex items-center gap-2 text-cyan-400 uppercase tracking-widest mb-6">
                  <HelpCircle className="w-4 h-4" /> Logic Chain
                </h2>
                <div className="flex-1 space-y-4 overflow-auto custom-scrollbar pr-4">
                  {[
                    { step: '01', title: '核心问题定义', desc: '确定多维空间中的引力扰动常数。', status: 'completed' },
                    { step: '02', title: '逻辑分支 A 展开', desc: '假设存在非线性扰动项，推导拓扑结构。', status: 'active' },
                    { step: '03', title: '逻辑分支 B 展开', desc: '假设常数项固定，验证引力透镜效应。', status: 'pending' },
                    { step: '04', title: '交叉验证', desc: '对比 A/B 分支的模拟结果。', status: 'pending' }
                  ].map((node, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-6 rounded-3xl border backdrop-blur-xl transition-all ${
                        node.status === 'active' 
                          ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                          : 'bg-white/5 border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-sm ${
                            node.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                            node.status === 'active' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {node.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : node.step}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white mb-1">{node.title}</div>
                            <div className="text-xs text-zinc-400 font-mono">{node.desc}</div>
                          </div>
                        </div>
                        {node.status === 'active' && (
                          <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
                            Processing
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 快速行动栏 */}
              <div className="p-8 flex justify-center gap-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><Zap className="w-3.5 h-3.5" /> 挑战逻辑</button>
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><AlertTriangle className="w-3.5 h-3.5" /> 寻找反例</button>
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><Scale className="w-3.5 h-3.5" /> 形式化证明</button>
                <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><Shield className="w-3.5 h-3.5" /> 逻辑闭环</button>
              </div>
            </div>

            <div className="w-1/3 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <ArrowRight className="w-3 h-3" /> Formal Proof
              </h2>
              <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 p-6 font-mono text-xs text-zinc-400 leading-relaxed overflow-auto custom-scrollbar">
                <div className="mb-4 text-emerald-400 flex items-center justify-between">
                  <span># 多 Agent 辩论生成的推理链</span>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-400/10 rounded-full">VERIFIED</span>
                </div>
                <div className="mb-4 text-zinc-500"># 正在进行形式化验证...</div>
                <div className="mb-4 text-blue-400">def verify_logic_chain(nodes):</div>
                <div className="pl-4 mb-1">"""</div>
                <div className="pl-4 mb-1">验证逻辑链的连贯性与置信度</div>
                <div className="pl-4 mb-4">"""</div>
                <div className="pl-4 mb-1 text-purple-400">confidence = 0.942</div>
                <div className="pl-4 mb-1 text-cyan-400">if confidence &gt; 0.9:</div>
                <div className="pl-8 mb-4 text-emerald-400">return "SUCCESS"</div>
                <div className="pl-4 mb-4 text-cyan-400">return "RE-EVALUATE"</div>
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-[10px] text-zinc-500">
                  System Output: [SUCCESS] Logic chain verified.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ====================== ADVANCED VIEW ====================== */
          <div className="flex w-full">
            <div className="w-80 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-cyan-400 mb-6 flex items-center gap-2 uppercase">
                <BrainCircuit className="w-3 h-3" /> Reasoning Engine
              </h2>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-cyan-400 mb-1 uppercase">置信度</div>
                  <div className="text-2xl font-mono font-bold text-white">{confidence}%</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-zinc-400">
                  Agent-7 提出反例，正在验证边界条件...
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-mono text-xs flex items-center gap-2 text-cyan-400 uppercase tracking-widest">
                  <HelpCircle className="w-4 h-4" /> Logic Chain Canvas
                </h2>
                <div className="text-xs px-4 py-1.5 bg-cyan-400/10 text-cyan-400 rounded-3xl">逻辑一致性 100%</div>
              </div>
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
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <FileCode className="w-3 h-3" /> Formal Proof Editor
              </h2>
              <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="python"
                  defaultValue={`# 多 Agent 辩论生成的推理链\n# 正在进行形式化验证...\n\ndef verify_logic_chain(nodes):\n    """\n    验证逻辑链的连贯性与置信度\n    """\n    confidence = 0.942\n    if confidence > 0.9:\n        return "SUCCESS"\n    return "RE-EVALUATE"\n\nprint(verify_logic_chain(current_chain))`}
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
          </div>
        )}
      </div>

      <MemoryOrb />
    </div>
  );
}

