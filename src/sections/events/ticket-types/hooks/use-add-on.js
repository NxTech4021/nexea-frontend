import { create } from 'zustand';

export const useAddOnsStore = create((set) => ({
  selectedAddOns: [],
  setSelectedAddOns: (data) =>
    set((state) => ({
      selectedAddOns: state.selectedAddOns.some((a) => a.id === data.id)
        ? state.selectedAddOns.filter((b) => b.id !== data.id) // Remove if already present
        : [...state.selectedAddOns, data], // Add if not present
    })),
}));
