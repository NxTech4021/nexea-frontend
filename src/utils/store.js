import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      tickets: [],
      setTickets: (data) => set(() => ({ tickets: data || get().tickets })),
      updateTickets: (id, updatedData) =>
        set((state) => ({
          tickets: get().tickets.map((ticket) =>
            ticket.id === id
              ? { ...ticket, ...updatedData, subTotal: ticket.price * updatedData.quantity }
              : ticket
          ),
        })),
    }),
    {
      name: 'cart',
    }
  )
);

// const [tickets, setTickets] = useState()
