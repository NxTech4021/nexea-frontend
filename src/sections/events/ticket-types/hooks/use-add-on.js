import { create } from 'zustand';

export const useAddOnsStore = create((set) => ({
  selectedAddOns: [],
  setSelectedAddOns: (data) =>
    set((state) => ({
      selectedAddOns: state.selectedAddOns.some((a) => a.name === data.name)
        ? state.selectedAddOns.filter((b) => b.name !== data.name) // Remove if already present
        : [...state.selectedAddOns, data], // Add if not present
    })),
}));
