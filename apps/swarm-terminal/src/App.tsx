import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutGrid, Activity, ShieldCheck, Cpu } from 'lucide-react';
import ProgrammingMode from './components/ProgrammingMode';
import ResearchMode from './components/ResearchMode';
import ReasoningMode from './components/ReasoningMode';
import EvolutionMode from './components/EvolutionMode';
import CreationMode from './components/CreationMode';
import ModeSelector from './components/ModeSelector';
import ParticlesBackground from './components/ParticlesBackground';
import MemoryOrb from './components/MemoryOrb';
import SecretDigitalRealm from './components/SecretDigitalRealm';
import { useModeStore } from './store/modeStore';
import { cn } from './lib/utils';

export default function App() {
  const { currentMode } = useModeStore();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSecretRealmOpen, setIsSecretRealmOpen] = useState(false);

  // 模拟 Agent 在线状态
  const [onlineAgents] = useState([
    { id: 1, color: 'blue' },
    { id: 2, color: 'emerald' },
    { id: 3, color: 'purple' },
    { id: 4, color: 'amber' },
    { id: 5, color: 'cyan' },
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-hidden font-sans relative">
      {/* 全局粒子背景 */}
      <ParticlesBackground />

      {/* 顶部极窄 Bar - 仪式感入口 */}
      <header className="h-12 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center px-6 z-[60] sticky top-0">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsSelectorOpen(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-black transition-all duration-500",
            currentMode === 'programming' && "bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]",
            currentMode === 'research' && "bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
            currentMode === 'reasoning' && "bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
            currentMode === 'evolution' && "bg-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.4)]",
            currentMode === 'creation' && "bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          )}>
            A
          </div>
          <span className="font-mono text-lg tracking-[-0.05em] font-bold group-hover:text-blue-400 transition-colors">AGORA</span>
          <LayoutGrid className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
        </motion.div>

        <div className="flex-1 flex justify-center">
          <div className={cn(
            "flex items-center gap-2 px-4 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500",
            currentMode === 'programming' && "text-blue-400 border-blue-400/20",
            currentMode === 'research' && "text-purple-400 border-purple-400/20",
            currentMode === 'reasoning' && "text-cyan-400 border-cyan-400/20",
            currentMode === 'evolution' && "text-amber-400 border-amber-400/20",
            currentMode === 'creation' && "text-orange-400 border-orange-400/20"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              currentMode === 'programming' && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
              currentMode === 'research' && "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
              currentMode === 'reasoning' && "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
              currentMode === 'evolution' && "bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
              currentMode === 'creation' && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
            )} />
            {currentMode.replace('-', ' ')} Mode
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {onlineAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  whileHover={{ y: -2, zIndex: 10 }}
                  className={cn(
                    "w-5 h-5 rounded-full border border-black shadow-lg cursor-help",
                    agent.color === 'blue' && "bg-blue-500",
                    agent.color === 'emerald' && "bg-emerald-500",
                    agent.color === 'purple' && "bg-purple-500",
                    agent.color === 'amber' && "bg-amber-500",
                    agent.color === 'cyan' && "bg-cyan-500"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">5 Swarm Active</span>
          </div>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-4 text-zinc-500">
            <Activity className="w-4 h-4 hover:text-blue-400 cursor-pointer transition-colors" />
            <ShieldCheck className="w-4 h-4 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Cpu className="w-4 h-4 hover:text-purple-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-48px)] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            {currentMode === 'programming' && <ProgrammingMode />}
            {currentMode === 'research' && <ResearchMode />}
            {currentMode === 'reasoning' && <ReasoningMode />}
            {currentMode === 'evolution' && <EvolutionMode />}
            {currentMode === 'creation' && <CreationMode />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 全局 Memory Orb */}
      <MemoryOrb />

      <ModeSelector 
        isOpen={isSelectorOpen} 
        onClose={() => setIsSelectorOpen(false)} 
        onSecretTrigger={() => {
          setIsSelectorOpen(false);
          setIsSecretRealmOpen(true);
        }}
      />

      <AnimatePresence>
        {isSecretRealmOpen && (
          <SecretDigitalRealm onClose={() => setIsSecretRealmOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
