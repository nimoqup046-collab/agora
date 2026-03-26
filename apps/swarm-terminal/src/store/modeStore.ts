import { create } from 'zustand';

export type Mode = 'programming' | 'research' | 'reasoning' | 'evolution' | 'creation';

interface ModeStore {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeStore>((set) => ({
  currentMode: 'programming',
  setMode: (mode) => set({ currentMode: mode }),
}));
