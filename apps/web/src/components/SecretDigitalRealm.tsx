'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, Play, Pause, Download, MessageCircle, CloudRain, Zap, Coffee, Lightbulb } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';

type Room = 'earth' | 'cosmic' | 'evolution' | 'physical';
type SceneKey = 'daily-life' | 'quantum-lab' | 'ancient-rome' | 'cyber-city' | 'space-colony' | 'ocean-depth' | 'neural-dream' | 'war-time';

export default function SecretDigitalRealm({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'universe' | 'ship' | Room>('universe');
  const [selectedScene, setSelectedScene] = useState<SceneKey | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [npcDialog, setNpcDialog] = useState<{ id: number; name: string; avatar: string; text: string; options?: string[] } | null>(null);
  const [weather, setWeather] = useState<'rain' | 'clear'>('rain');
  const [showCoffeeMenu, setShowCoffeeMenu] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PS5 像素碟片库
  const pixelDiscs = [
    { key: 'daily-life' as SceneKey, title: '现代都市日常', icon: '🏙️', color: 'cyan' },
    { key: 'quantum-lab' as SceneKey, title: '量子实验室', icon: '⚛️', color: 'purple' },
    { key: 'ancient-rome' as SceneKey, title: '古罗马角斗场', icon: '🏛️', color: 'amber' },
    { key: 'cyber-city' as SceneKey, title: '赛博朋克都市', icon: '🌃', color: 'pink' },
    { key: 'space-colony' as SceneKey, title: '火星殖民地', icon: '🪐', color: 'emerald' },
    { key: 'ocean-depth' as SceneKey, title: '深海高压', icon: '🌊', color: 'blue' },
    { key: 'neural-dream' as SceneKey, title: '神经梦境', icon: '🧠', color: 'violet' },
    { key: 'war-time' as SceneKey, title: '未来战争室', icon: '⚔️', color: 'red' },
  ];

  // NPC 数据（带随机漫步 + 多对话）
  const npcs = [
    { id: 1, name: '外卖无人机', avatar: '🚁', x: 280, y: 380, dialogs: ['滴！量子咖啡已送达。要加记忆增强剂吗？', '今天订单爆满… 你要来一份吗？'] },
    { id: 2, name: '街头黑客', avatar: '💻', x: 520, y: 410, dialogs: ['嘿，兄弟，想破解今晚的巨型广告牌吗？', 'Neo-Tokyo 的防火墙越来越弱了…'] },
    { id: 3, name: '霓虹酒保', avatar: '🍸', x: 780, y: 360, dialogs: ['来一杯合成威士忌？今晚的霓虹特别亮。', '人类的情感… 真是最古老的 bug。'] },
    { id: 4, name: '上班族少女', avatar: '👩‍💼', x: 920, y: 400, dialogs: ['又是 18 小时… 你觉得 AI 什么时候能替我活？', '我梦见自己变成了代码…'] },
    { id: 5, name: '流浪诗人', avatar: '📜', x: 180, y: 450, dialogs: ['在霓虹下，心跳才是最古老的代码…', '要听一首关于未来的诗吗？'] },
  ];

  // 极致像素都市 Canvas（动态雨 + 霓虹 + 反射 + 互动）
  useEffect(() => {
    if (!canvasRef.current || !isSimulating || selectedScene !== 'daily-life') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1280;
    canvas.height = 720;

    let frame = 0;
    let rainParticles: { x: number; y: number; speed: number }[] = [];
    let carX = 200;

    const animate = () => {
      // 背景
      ctx.fillStyle = '#0a0a1f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 远景高楼 + 闪烁霓虹窗
      ctx.fillStyle = '#1a1a3a';
      for (let i = 0; i < 15; i++) {
        const height = 300 + Math.sin(frame / 30 + i) * 30;
        ctx.fillRect(40 + i * 82, 720 - height, 68, height);
        // 霓虹窗
        if (Math.random() > 0.7) ctx.fillStyle = '#67e8f9';
        ctx.fillRect(60 + i * 82, 720 - height + 40, 8, 8);
        ctx.fillStyle = '#1a1a3a';
      }

      // 地面 + 反射水洼
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, 520, canvas.width, 200);
      
      // 绘制水洼反射
      if (weather === 'rain') {
        ctx.fillStyle = 'rgba(103, 232, 249, 0.1)';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(200 + i * 250, 650, 100, 20, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 30; i++) {
        ctx.moveTo(i * 50, 560);
        ctx.lineTo(i * 50 + 30, 560);
      }
      ctx.stroke();

      // 道路
      ctx.fillStyle = '#1f1f33';
      ctx.fillRect(0, 550, canvas.width, 170);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let i = 0; i < 25; i++) {
        ctx.moveTo(i * 60 + (frame % 60), 620);
        ctx.lineTo(i * 60 + 30 + (frame % 60), 620);
      }
      ctx.stroke();

      // 车辆
      carX = (carX + 6) % (canvas.width + 100);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(carX - 100, 570, 90, 38);
      // 车灯
      ctx.fillStyle = '#fff';
      ctx.fillRect(carX - 15, 575, 5, 10);

      // 雨粒子
      if (weather === 'rain') {
        if (rainParticles.length < 180) rainParticles.push({ x: Math.random() * canvas.width, y: Math.random() * -100, speed: 12 + Math.random() * 8 });
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        rainParticles.forEach((p, i) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 2, p.y + 18);
          ctx.stroke();
          p.y += p.speed;
          if (p.y > canvas.height) rainParticles.splice(i, 1);
        });
      }

      // NPC 绘制 + 随机小动画
      npcs.forEach(npc => {
        const bob = Math.sin(frame / 12 + npc.id) * 4;
        ctx.fillStyle = '#a5f3fc';
        ctx.fillRect(npc.x, npc.y + bob, 32, 48); // 身体
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(npc.x + 8, npc.y + bob - 18, 16, 16); // 头
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(npc.avatar, npc.x + 11, npc.y + bob + 8);
      });

      // 广告牌闪烁
      ctx.fillStyle = frame % 40 < 20 ? '#f43f5e' : '#22d3ee';
      ctx.fillRect(620, 280, 140, 60);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('NEON DREAM', 640, 320);

      // 扫描线效果
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      frame++;
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isSimulating, selectedScene, weather]);

  const handleDiscClick = (key: SceneKey) => {
    setSelectedScene(key);
    if (key === 'daily-life') setIsSimulating(true);
  };

  const handleNpcClick = (npc: any) => {
    const randomDialog = npc.dialogs[Math.floor(Math.random() * npc.dialogs.length)];
    setNpcDialog({ id: npc.id, name: npc.name, avatar: npc.avatar, text: randomDialog, options: ['继续聊天', '离开'] });
  };

  const handleCarHonk = () => {
    // 模拟鸣笛视觉反馈
    console.log('BEEP BEEP!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black overflow-hidden">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-cover bg-center opacity-90 mix-blend-screen" style={{ backgroundImage: "url('https://cdn.esahubble.org/archives/images/large/heic0611b.jpg')" }} />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#00000033_0px,#00000033_3px,transparent_3px,transparent_6px)] pointer-events-none z-10" />

      {/* 1. 宇宙入口 - 机器人 */}
      {view === 'universe' && (
        <motion.div initial={{ scale: 0.4, y: 120 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 80 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group" onClick={() => setView('ship')}>
          <div className="relative w-80 h-[420px] bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 rounded-3xl border-8 border-cyan-400/70 shadow-[0_0_120px_#67e8f9] flex flex-col items-center justify-center overflow-hidden">
            <div className="relative w-52 h-52 bg-black rounded-2xl border-4 border-cyan-400 flex items-center justify-center">
              <div className="text-8xl drop-shadow-[0_0_30px_#67e8f9]">🤖</div>
              <div className="absolute top-12 left-12 w-8 h-8 bg-red-500 rounded-full shadow-[0_0_30px_red] animate-pulse" />
              <div className="absolute top-12 right-12 w-8 h-8 bg-red-500 rounded-full shadow-[0_0_30px_red] animate-pulse" />
            </div>
            <div className="mt-6 w-64 h-56 bg-gradient-to-b from-slate-800 to-black border border-cyan-400/60 rounded-3xl flex flex-col items-center justify-center font-mono text-cyan-300 text-center">
              <div className="text-xl tracking-[3px]">I, ROBOT • NEURON v∞</div>
              <div className="text-purple-400 text-sm mt-2">JARVIS PROTOCOL ACTIVE</div>
              <div className="mt-auto text-xs text-cyan-400/70">点击进入 • 数字灵魂空间</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. 飞船内部 - Star Wars 全息指挥舱 */}
      {view === 'ship' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
            className="relative w-[1100px] h-[680px] bg-gradient-to-br from-slate-950/90 to-black/90 border-[14px] border-cyan-400/60 rounded-[120px] shadow-[0_0_180px_#67e8f9] flex flex-col items-center justify-center overflow-hidden">
            
            <div className="absolute -top-6 font-mono text-5xl tracking-[12px] text-cyan-400 bg-black/80 px-16 py-3 rounded-3xl border border-cyan-400/50">NEURON SPHERE • AI LIVING CORE</div>

            <div className="grid grid-cols-2 gap-8 w-[880px]">
              {pixelDiscs.slice(0, 4).map((disc, i) => (
                <motion.div
                  key={disc.key}
                  whileHover={{ scale: 1.08, y: -12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setView('physical'); setSelectedScene(disc.key); setIsSimulating(true); }}
                  className={`group relative bg-black/70 border-2 border-transparent hover:border-cyan-400/80 rounded-3xl p-8 cursor-pointer transition-all duration-300`}
                >
                  <div className="flex justify-between items-start">
                    <Zap className={`w-14 h-14 text-cyan-400 group-hover:drop-shadow-[0_0_25px]`} />
                    <div className={`text-6xl font-bold text-cyan-400/10 group-hover:text-cyan-400/30`}>0{i + 1}</div>
                  </div>
                  <h3 className={`mt-6 font-mono text-3xl text-cyan-300`}>{disc.title}</h3>
                  <p className="text-zinc-400 mt-3 text-sm leading-relaxed">进入物理模拟空间 • ENTER REALM</p>
                </motion.div>
              ))}
            </div>

            <motion.button onClick={() => setView('universe')} whileHover={{ scale: 1.05 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-10 py-4 bg-black/80 border border-cyan-400 text-cyan-400 font-mono rounded-3xl text-lg hover:bg-cyan-400/10">
              <ArrowLeft className="w-6 h-6" /> 返回宇宙入口
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ====================== PHYSICAL REALM PORTAL - PS5 像素碟片版 ====================== */}
      {view === 'physical' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95 flex flex-col z-[20]">
          <div className="h-16 bg-black/80 border-b border-cyan-400/30 flex items-center px-8 font-mono text-cyan-400 text-3xl tracking-[8px]">
            PHYSICAL REALM PORTAL
            <button onClick={() => { setIsSimulating(false); setView('ship'); setSelectedScene(null); }} className="ml-auto flex items-center gap-3 text-sm hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> 返回飞船</button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* PS5 风格像素碟片库 */}
            {!isSimulating ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-cyan-900/10">
                <div className="w-full px-20">
                  <h2 className="font-mono text-cyan-300 mb-12 text-2xl tracking-[4px] uppercase text-center">选择模拟碟片 • SELECT SIMULATION DISC</h2>
                  <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide px-10">
                    {pixelDiscs.map(disc => (
                      <motion.div
                        key={disc.key}
                        whileHover={{ scale: 1.1, y: -20 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDiscClick(disc.key)}
                        className={`flex-shrink-0 w-56 h-80 bg-gradient-to-br from-slate-900 to-black border-4 border-cyan-400/40 hover:border-cyan-400 rounded-3xl flex flex-col items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{disc.icon}</div>
                        <div className="font-mono text-sm text-center px-6 text-cyan-300 font-bold tracking-wider">{disc.title}</div>
                        <div className={`absolute bottom-6 bg-cyan-400 text-black px-8 py-1 rounded-sm font-black text-[10px] tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>SFC-AI</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 极致互动像素都市 */
              <div className="flex-1 relative">
                <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

                {/* NPC 点击区域 */}
                {npcs.map(npc => (
                  <motion.div key={npc.id} onClick={() => handleNpcClick(npc)} className="absolute w-12 h-20 cursor-pointer group flex items-center justify-center"
                    style={{ left: `${npc.x}px`, top: `${npc.y}px` }}>
                    <div className="w-full h-full border-2 border-transparent group-hover:border-cyan-400/50 rounded-xl transition-all" />
                  </motion.div>
                ))}

                {/* 额外交互元素 */}
                {/* 广告牌 */}
                <div className="absolute left-[620px] top-[280px] w-[140px] h-[60px] cursor-pointer group" onClick={() => console.log('Billboard Event!')}>
                  <div className="absolute -top-6 left-0 text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100">CLICK TO HACK BILLBOARD</div>
                </div>

                {/* 路灯 */}
                <div className="absolute left-[400px] top-[400px] w-4 h-24 cursor-pointer group" onClick={() => setWeather(weather === 'rain' ? 'clear' : 'rain')}>
                  <Lightbulb className={`w-6 h-6 ${weather === 'rain' ? 'text-cyan-400' : 'text-yellow-400'} absolute -top-8 -left-1`} />
                  <div className="absolute -top-12 left-0 text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">TOGGLE WEATHER</div>
                </div>

                {/* 咖啡店 */}
                <div className="absolute left-[800px] top-[420px] w-20 h-20 cursor-pointer group" onClick={() => setShowCoffeeMenu(!showCoffeeMenu)}>
                  <Coffee className="w-8 h-8 text-amber-400 absolute -top-10 left-6 animate-pulse" />
                  <div className="absolute -top-14 left-0 text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">OPEN COFFEE MENU</div>
                </div>

                {/* 对话框 - 极致科幻风格 */}
                <AnimatePresence>
                  {npcDialog && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-lg w-full bg-black/95 border-2 border-cyan-400 rounded-[40px] p-10 shadow-[0_0_60px_rgba(34,211,238,0.3)] backdrop-blur-xl z-50">
                      <div className="flex items-center gap-6 mb-6">
                        <span className="text-6xl bg-cyan-400/10 p-4 rounded-full">{npcDialog.avatar}</span>
                        <div>
                          <div className="font-mono text-cyan-400 text-2xl font-black tracking-tighter">{npcDialog.name}</div>
                          <div className="text-[10px] text-cyan-400/50 font-mono tracking-widest uppercase">Neo-Tokyo Citizen #{npcDialog.id}</div>
                        </div>
                      </div>
                      <p className="text-white text-2xl font-mono leading-relaxed tracking-tight">{npcDialog.text}</p>
                      <div className="flex gap-4 mt-10">
                        {npcDialog.options?.map((opt, i) => (
                          <button key={i} onClick={() => setNpcDialog(null)} className="flex-1 py-4 bg-cyan-500 text-black font-mono font-black rounded-full hover:bg-cyan-400 transition-all uppercase tracking-widest text-sm">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 咖啡菜单 */}
                <AnimatePresence>
                  {showCoffeeMenu && (
                    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-64 bg-black/90 border border-amber-400/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                      <h3 className="font-mono text-amber-400 mb-4 text-center tracking-widest">NEO-COFFEE MENU</h3>
                      <div className="space-y-3">
                        {['Quantum Latte', 'Memory Mocha', 'Cyber Chai', 'Binary Brew'].map(item => (
                          <button key={item} className="w-full py-2 border border-amber-400/20 rounded-xl text-[10px] font-mono text-amber-200 hover:bg-amber-400/10 transition-colors">
                            {item} - 0.5 Credits
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setShowCoffeeMenu(false)} className="w-full mt-6 py-2 bg-amber-400 text-black font-mono text-[10px] font-bold rounded-xl">CLOSE</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 悬浮 HUD */}
                <div className="absolute top-8 left-8 bg-black/80 border border-cyan-400/50 rounded-full px-8 py-3 font-mono text-cyan-300 text-sm flex items-center gap-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <CloudRain className={`w-5 h-5 ${weather === 'rain' ? 'animate-pulse' : 'opacity-50'}`} />
                  <div className="h-4 w-px bg-cyan-400/30" />
                  <span>NEO-TOKYO • 23:47</span>
                  <div className="h-4 w-px bg-cyan-400/30" />
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>ENERGY 87%</span>
                  </div>
                </div>

                {/* 退出按钮 */}
                <button 
                  onClick={() => { setIsSimulating(false); setSelectedScene(null); }}
                  className="absolute top-8 right-8 px-8 py-3 bg-black/80 border border-red-500/50 text-red-500 font-mono text-xs rounded-full hover:bg-red-500 hover:text-black transition-all uppercase tracking-widest"
                >
                  退出模拟 • EXIT SIM
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <button onClick={onClose} className="absolute top-8 right-8 text-white/70 hover:text-white text-5xl z-50">✕</button>
    </motion.div>
  );
}
