import { create } from "zustand";

interface SelectedDateState {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  resetSelectedDate: () => void;
}
export const useSelectedDateState = create<SelectedDateState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  resetSelectedDate: () => set({ selectedDate: new Date() }),
}));
