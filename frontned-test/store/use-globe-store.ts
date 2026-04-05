import { create } from "zustand";

interface GlobeState {
  targetLocation: Attack | null;
  setTargetLocation: (attack: Attack) => void;
  resetLocation: () => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  targetLocation: null,
  setTargetLocation: (attack: Attack) => set({ targetLocation: attack }),
  resetLocation: () => set({ targetLocation: null }),
}));
