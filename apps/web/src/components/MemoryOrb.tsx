'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useModeStore } from '@/src/store/modeStore';
import { Brain, Search, Zap, X } from 'lucide-react';

export default function MemoryOrb() {
  const { currentMode } = useModeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [memoryItems] = useState([  // 可后续接后端 /api/memory
    { id: 1, title: 'AlphaFold 新变体模拟', snippet: '蛋白序列 + 折叠结构 PR #47', mode: 'programming' },
    { id: 2, title: '暗物质假设验证', snippet: 'Wolfram MCP 结果已保存', mode: 'research' },
  ]);

  return (
    <>
      {/* 浮动 Orb */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ rotate: 360, scale: 1.15 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center cursor-pointer shadow-[0_0_50px_rgb(59,130,246)] border border-white/30 z-50"
      >
        <Brain className="w-7 h-7 text-white" />
        
        {/* 脉动光圈 */}
        <div className="absolute inset-0 rounded-inherit border border-white/20 animate-ping opacity-20" />
      </motion.div>

      {/* 展开抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-96 bg-zinc-900/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-2xl z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-xs font-bold text-purple-400 uppercase tracking-widest">GLOBAL MEMORY • 蜂群共享知识库</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
              <input className="w-full bg-white/10 border border-white/20 rounded-3xl pl-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="搜索记忆..." />
            </div>

            <div className="space-y-3 max-h-80 overflow-auto pr-2 custom-scrollbar">
              {memoryItems.map(item => (
                <div key={item.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 text-sm transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-mono text-purple-300 group-hover:text-purple-200 transition-colors">{item.title}</div>
                    <span className="text-[8px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-zinc-500 uppercase">{item.mode}</span>
                  </div>
                  <div className="text-zinc-400 text-xs mt-1 leading-relaxed">{item.snippet}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-[10px] font-mono text-zinc-500 mb-3 uppercase tracking-widest text-center">当前模式: {currentMode} 同步中</div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-mono text-xs font-bold rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                一键 Distill 到 SOUL.md
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
