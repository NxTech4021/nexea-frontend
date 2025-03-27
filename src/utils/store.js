import { create } from 'zustand';

export const useCartStore = create((set) => ({
  tickets: [],
  setTickets: (data) => set(() => ({ tickets: data })),
  updateTickets: (id, updatedData) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) => {
        if (ticket.id !== id) return ticket;

        const prevQuantity = ticket.selectedQuantity || 0;
        const newQuantity = updatedData.selectedQuantity || 0;
        const isReducing = newQuantity < prevQuantity;

        // Ensure new array reference for addOns
        const updatedAddOns = ticket.addOns.map((addOn) => ({
          ...addOn,
          selectedQuantity: isReducing
            ? Math.min(addOn.selectedQuantity, newQuantity) // Reduce if needed
            : addOn.selectedQuantity,
        }));

        const addOnsTotal = updatedAddOns.reduce(
          (sum, addOn) => sum + (addOn.price || 0) * (addOn.selectedQuantity || 0),
          0
        );

        return {
          ...ticket,
          ...updatedData,
          addOns: [...updatedAddOns], // Ensure a new reference
          subTotal: newQuantity * ticket.price + addOnsTotal,
        };
      }),
    })),

  updateAddOnQuantity: (ticketId, addOnId, type) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;

        const updatedAddOns = ticket.addOns.map((addOn) =>
          addOn.id === addOnId
            ? {
                ...addOn,
                selectedQuantity:
                  type === 'increment'
                    ? (addOn?.selectedQuantity || 0) + 1
                    : Math.max(0, (addOn?.selectedQuantity || 0) - 1),
              }
            : addOn
        );

        // Calculate the new add-ons total price
        const addOnsTotal = updatedAddOns.reduce(
          (sum, addOn) => sum + (addOn.price || 0) * (addOn.selectedQuantity || 0),
          0
        );

        return {
          ...ticket,
          addOns: updatedAddOns,
          subTotal: ticket.price * ticket.selectedQuantity + addOnsTotal, // Updated subtotal
        };
      }),
    })),
}));
