'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { MessageCircle, BookOpen, Brain, Send, ToggleLeft, ToggleRight, Globe, Search, Lightbulb, CheckCircle, FileText } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import MemoryOrb from './MemoryOrb';

const initialNodes = [
  { id: 'hyp1', position: { x: 100, y: 100 }, data: { label: '暗物质假设 A' }, style: { background: '#a855f7', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
  { id: 'verify', position: { x: 400, y: 150 }, data: { label: 'Wolfram MCP 验证' }, style: { background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' } },
];

const initialEdges = [{ id: 'e1', source: 'hyp1', target: 'verify', animated: true, style: { stroke: '#a855f7' } }];

export default function ResearchMode() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [confidence, setConfidence] = useState(92);
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
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">R</div>
          <span className="font-mono text-2xl tracking-tight">AGORA</span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="px-8 py-1.5 bg-white/10 backdrop-blur-xl rounded-3xl font-mono text-sm border border-purple-400/30">RESEARCH MODE</div>
        </div>

        {/* 切换按钮 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdvanced(!isAdvanced)}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-3xl text-sm font-mono"
        >
          {isAdvanced ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{isAdvanced ? 'Advanced Research View' : 'Classic View'}</span>
        </motion.button>
      </div>

      <div className="pt-14 flex h-[calc(100vh-56px)]">
        {!isAdvanced ? (
          /* ====================== CLASSIC VIEW ====================== */
          <div className="flex w-full">
            <div className="w-80 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-mono text-xs tracking-[2px] text-purple-400 flex items-center gap-2 uppercase">
                  <MessageCircle className="w-3 h-3" /> Council Arena
                </h2>
                <div className="flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-auto custom-scrollbar pr-2">
                {[
                  { agent: 'AGENT-ALPHA', msg: '初步观测显示引力透镜效应与假设 A 吻合。', color: 'text-purple-400' },
                  { agent: 'WOLFRAM-BOT', msg: '正在通过计算几何引擎验证拓扑结构...', color: 'text-blue-400' },
                  { agent: 'AGENT-BETA', msg: '建议引入非线性扰动项进行二次模拟。', color: 'text-emerald-400' }
                ].map((chat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                  >
                    <div className={`text-[9px] font-mono ${chat.color} mb-1 uppercase tracking-widest`}>{chat.agent}</div>
                    <div className="text-xs text-zinc-300 leading-relaxed">{chat.msg}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  placeholder="向议事厅提问..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs font-mono focus:outline-none focus:border-purple-500/50"
                />
                <Send className="absolute right-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              </div>
            </div>

            <div className="flex-1 flex flex-col relative">
              <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ 
                      rotateY: 360,
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-64 h-64 rounded-full border-2 border-purple-500/30 flex items-center justify-center relative group"
                  >
                    <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-[spin_15s_linear_infinite]" />
                    <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-[spin_10s_linear_infinite_reverse]" />
                    
                    <Globe className="w-24 h-24 text-purple-400/80 group-hover:text-purple-400 transition-colors" />
                    
                    {[0, 72, 144, 216, 288].map((angle, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                        style={{
                          top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                          left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                        }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                      />
                    ))}
                  </motion.div>
                  
                  <div className="mt-12 text-center">
                    <h3 className="font-mono text-xl text-white tracking-[4px] uppercase mb-2">Knowledge Sphere</h3>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[2px]">Collective Intelligence Active • 11D Dimension</p>
                  </div>
                </div>
              </div>

              {/* 快速行动栏 */}
              <div className="p-8 flex justify-center gap-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><Search className="w-3.5 h-3.5" /> 深度搜索</button>
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><Lightbulb className="w-3.5 h-3.5" /> 综合假设</button>
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><CheckCircle className="w-3.5 h-3.5" /> 验证来源</button>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-3xl text-xs font-mono flex items-center gap-2 transition-all"><FileText className="w-3.5 h-3.5" /> 生成摘要</button>
              </div>
            </div>

            <div className="w-80 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <BookOpen className="w-3 h-3" /> Research Notes
              </h2>
              <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 p-6 font-mono text-xs text-zinc-400 leading-relaxed overflow-auto custom-scrollbar">
                <div className="mb-4 text-emerald-400 flex items-center justify-between">
                  <span># 未解难题记录</span>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-400/10 rounded-full">v2.4</span>
                </div>
                <div className="mb-2 underline decoration-emerald-500/30">## 暗物质模型验证</div>
                <div className="mb-4 text-[10px] text-zinc-500">来源: arXiv:2403.12345 · NASA Data Portal</div>
                <div className="mb-4">- 使用 MCP-Wolfram API</div>
                <div className="mb-4">- 模拟结果已保存到 Memory Orb</div>
                <div className="mb-2 underline decoration-emerald-500/30">### 实验参数</div>
                <div className="mb-1">- 维度: 11D</div>
                <div className="mb-4">- 耦合常数: 0.042</div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 italic text-[10px]">
                  "蜂群建议：重点关注非线性扰动项。"
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ====================== ADVANCED VIEW ====================== */
          <div className="flex w-full">
            <div className="w-80 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-purple-400 mb-6 flex items-center gap-2 uppercase">
                <MessageCircle className="w-3 h-3" /> Council Arena
              </h2>
              <div className="flex-1 space-y-4 overflow-auto custom-scrollbar pr-2">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-[9px] font-mono text-purple-400 mb-1">AGENT-ALPHA</div>
                  <div className="text-xs text-zinc-300">初步观测显示引力透镜效应与假设 A 吻合。</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-[9px] font-mono text-blue-400 mb-1">WOLFRAM-BOT</div>
                  <div className="text-xs text-zinc-300">正在通过计算几何引擎验证拓扑结构...</div>
                </div>
              </div>
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  placeholder="向议事厅提问..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs font-mono focus:outline-none focus:border-purple-500/50"
                />
                <Send className="absolute right-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-mono text-xs flex items-center gap-2 text-blue-400 uppercase tracking-widest">
                  <Brain className="w-4 h-4" /> Brainstorm Canvas
                </h2>
                <div className="text-xs px-4 py-1.5 bg-emerald-400/10 text-emerald-400 rounded-3xl">研究置信度 {confidence}%</div>
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
                  <MiniMap style={{ background: '#000', border: '1px solid #333' }} />
                  <Controls />
                </ReactFlow>
              </div>
            </div>

            <div className="w-1/3 bg-zinc-900/50 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col">
              <h2 className="font-mono text-xs tracking-[2px] text-emerald-400 mb-6 flex items-center gap-2 uppercase">
                <BookOpen className="w-3 h-3" /> Research Notes
              </h2>
              <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="markdown"
                  defaultValue={`# 未解难题记录\n\n## 暗物质模型验证\n- 使用 MCP-Wolfram API\n- 模拟结果已保存到 Memory Orb\n\n### 实验参数\n- 维度: 11D\n- 耦合常数: 0.042\n\n> 蜂群建议：重点关注非线性扰动项。`}
                  theme="vs-dark"
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono',
                    padding: { top: 20, bottom: 20 },
                    lineNumbers: 'off',
                    wordWrap: 'on'
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

