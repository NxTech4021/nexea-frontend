import { create } from 'zustand';

export const useCartStore = create((set) => ({
  tickets: [],
  setTickets: (data) => set(() => ({ tickets: data })),
  updateTickets: (id, updatedData) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === id
          ? { ...ticket, ...updatedData, subTotal: ticket.price * updatedData.selectedQuantity }
          : ticket
      ),
    })),
}));
