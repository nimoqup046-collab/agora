'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { ToggleLeft, ToggleRight, Cpu, Activity, ShieldCheck, Terminal as TerminalIcon } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import MemoryOrb from './MemoryOrb';

export default function ProgrammingMode() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showTV, setShowTV] = useState(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix 数字雨
  useEffect(() => {
    if (!matrixCanvasRef.current) return;
    const canvas = matrixCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 820;
      canvas.height = canvas.parentElement?.clientHeight || 620;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22ff88';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 35);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white relative overflow-hidden">
      <ParticlesBackground />

      {/* 强化版未来电脑机箱 */}
      <div className="max-w-screen-2xl mx-auto mt-8 px-8 mb-12">
        <div className="border-[22px] border-zinc-700 bg-zinc-950 rounded-[40px] shadow-[0_0_100px_#22d3ee,inset_0_0_60px_rgba(34,211,238,0.1)] overflow-hidden relative">
          
          {/* 机箱顶部铭牌 */}
          <div className="h-11 bg-black flex items-center px-10 text-[10px] font-mono tracking-[4px] text-cyan-400 border-b border-cyan-400/40 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-600 rounded-full shadow-[inset_0_0_5px_rgba(0,0,0,0.8)] border border-zinc-500"></div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-600 rounded-full shadow-[inset_0_0_5px_rgba(0,0,0,0.8)] border border-zinc-500"></div>
            
            <div className="flex items-center gap-4">
              <Cpu className="w-4 h-4 text-cyan-500 animate-pulse" />
              AGORA • SWARM TERMINAL v∞ • CORE_SYNC: 100% • CONNECTED TO 6 AGENTS
            </div>

            <div className="ml-auto flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 uppercase tracking-widest">Live Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400 uppercase tracking-widest">Synapse Secure</span>
              </div>
            </div>
          </div>

          {/* 顶部 Bar */}
          <div className="h-16 bg-black/90 backdrop-blur-2xl flex items-center px-10 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-cyan-500/20">A</div>
              <span className="font-mono text-3xl tracking-tighter font-black italic">AGORA</span>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div className="px-10 py-2 bg-cyan-500/5 backdrop-blur-3xl rounded-full font-mono text-xs border border-cyan-500/20 text-cyan-400 tracking-[2px] uppercase">
                Swarm Programming Environment
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 px-8 py-2.5 rounded-full text-xs font-mono transition-all hover:border-cyan-500/50"
            >
              {isAdvanced ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{isAdvanced ? 'Advanced Swarm' : 'Classic View'}</span>
            </motion.button>
          </div>

          <div className="flex h-[calc(100vh-220px)]">
            {/* 左侧 Swarm Canvas - 全息球体 */}
            <div className="w-80 bg-zinc-900/95 border-r border-white/5 p-8 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-500"></div>
              <h2 className="font-mono text-[10px] tracking-[3px] text-zinc-500 mb-10 flex items-center gap-2 uppercase">
                <div className="w-1 h-3 bg-cyan-500"></div> Swarm Canvas
              </h2>
              
              <div className="grid grid-cols-2 gap-6 flex-1">
                {[1,2,3,4,5,6].map(i => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.12, y: -4 }} 
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-[32px] blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-zinc-950 border border-cyan-400/60 rounded-[32px] p-5 text-center h-full flex flex-col items-center justify-center overflow-hidden">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-pulse">🌐</div>
                      <div className="font-mono text-[11px] text-cyan-300 group-hover:text-cyan-100 transition-colors">AGENT-{String(i).padStart(2, '0')}</div>
                      <div className="mt-2 flex justify-center items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">Synced</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 中间 - 黑客帝国终端 */}
            <div className="flex-1 flex flex-col relative bg-black border-l border-r border-white/10">
              <div className="h-11 bg-zinc-900/80 backdrop-blur-md flex items-center px-8 font-mono text-[10px] border-b border-white/5 text-zinc-500">
                <TerminalIcon className="w-3 h-3 mr-3 text-emerald-500" />
                <span className="text-emerald-500/80">$</span> swarm-terminal@agora ~ <span className="text-zinc-700 mx-2">|</span> <span className="text-cyan-500/50">main-branch</span>
                <div className="ml-auto flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> 6 nodes</span>
                </div>
              </div>

              {/* 跳跃的蘑菇 Logo（点击弹出电视） */}
              <div className="absolute top-4 right-10 cursor-pointer z-50" onClick={() => setShowTV(!showTV)}>
                <motion.div 
                  animate={{ y: [0, -14, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                  className="filter drop-shadow-[0_0_15px_#ff0000]"
                >
                  <span className="text-5xl">🍄</span>
                </motion.div>
              </div>

              {/* 数字雨 Canvas */}
              <div className="flex-1 relative overflow-hidden">
                <canvas ref={matrixCanvasRef} className="absolute inset-0 opacity-40 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-20"></div>
                
                <MonacoEditor 
                  height="100%" 
                  defaultLanguage="python" 
                  theme="vs-dark" 
                  value="// AGORA Swarm Terminal v∞\n> 蜂群已就绪\n> 正在同步神经元网络...\n> 状态：稳定"
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 16, 
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.8,
                    padding: { top: 30, left: 20 },
                    backgroundColor: 'transparent',
                    cursorStyle: 'block',
                    cursorBlinking: 'blink',
                    renderLineHighlight: 'none',
                    scrollbar: { vertical: 'hidden' }
                  }} 
                />
              </div>

              {/* 底部命令行 */}
              <div className="h-14 bg-zinc-900/90 border-t border-white/5 flex items-center px-8 font-mono text-sm text-emerald-500">
                <span className="text-emerald-400 mr-4 font-bold">$</span>
                <input
                  type="text"
                  placeholder="输入蜂群指令 /swarm propose / review / soul-inject ..."
                  className="flex-1 bg-transparent outline-none text-emerald-400 placeholder-zinc-700 text-xs tracking-wider"
                />
              </div>
            </div>

            {/* 右侧预览面板（非电视时显示） */}
            {!showTV && (
              <div className="w-80 bg-zinc-900/95 border-l border-white/5 p-8 flex flex-col">
                <h2 className="font-mono text-[10px] tracking-[3px] text-purple-400 uppercase mb-6">Live Preview</h2>
                <div className="flex-1 bg-black border border-purple-400/30 rounded-3xl overflow-hidden relative">
                  <div className="h-7 bg-zinc-800 flex items-center px-4 text-[10px] text-zinc-400">preview.agora.swarm • live</div>
                  <div className="h-[calc(100%-28px)] flex items-center justify-center text-purple-300 font-mono text-sm p-8 text-center">
                    这里是实时代码预览<br />当前代码运行结果将在这里渲染
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 独立 CRT 电视屏幕 ==================== */}
      <AnimatePresence>
        {showTV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && setShowTV(false)}
          >
            <div className="w-[1100px] bg-zinc-950 border-[30px] border-zinc-800 rounded-[40px] shadow-2xl relative overflow-hidden">
              {/* CRT 电视顶部 */}
              <div className="h-12 bg-zinc-900 flex items-center justify-center text-red-400 font-mono text-xs border-b border-red-400/30">
                CRT TELEVISION • YOUR GAME • CLICK ANYWHERE OUTSIDE TO CLOSE
              </div>

              {/* 直接加载你的网站 */}
              <iframe
                src="http://g.my71.top/intro/?id=6137"
                className="w-full h-[620px] border-0 bg-black"
                title="Game TV"
                allow="fullscreen; accelerometer; gyroscope; magnetometer"
                allowFullScreen
              />

              <div className="h-8 bg-zinc-900 text-[10px] font-mono text-center text-zinc-400 flex items-center justify-center">
                ←→ 移动 • SPACE 跳跃 • 正常点击游玩
              </div>
              
              {/* CRT 扫描线效果 */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] z-50"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MemoryOrb />
    </div>
  );
}
