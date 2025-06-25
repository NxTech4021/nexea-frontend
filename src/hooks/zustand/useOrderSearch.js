import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderSearchStore = create(
  persist(
    (set, get) => ({
      // Search state
      searchQuery: '',
      statusFilter: 'All',
      priceSort: null,
      dateRange: 'thisWeek',
      page: 0,
      rowsPerPage: 10,
      
      // Selected event
      selectedEventId: null,
      
      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setStatusFilter: (filter) => set({ statusFilter: filter }),
      setPriceSort: (sort) => set({ priceSort: sort }),
      setDateRange: (range) => set({ dateRange: range }),
      setPage: (page) => set({ page }),
      setRowsPerPage: (rowsPerPage) => set({ rowsPerPage, page: 0 }),
      setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
      
      // Reset search but keep selected event
      resetSearch: () => set({ 
        searchQuery: '', 
        statusFilter: 'All', 
        priceSort: null,
        page: 0 
      }),
      
      // Reset all filters
      resetAll: () => set({ 
        searchQuery: '', 
        statusFilter: 'All', 
        priceSort: null,
        dateRange: 'thisWeek',
        page: 0,
        rowsPerPage: 10,
        selectedEventId: null
      }),
      
      // Toggle price sort
      togglePriceSort: () => {
        const current = get().priceSort;
        let newSort = null;
        if (current === 'desc') newSort = 'asc';
        else if (current === 'asc') newSort = null;
        else newSort = 'desc';
        set({ priceSort: newSort });
      },
      
      // Advanced search function with match context
      searchOrders: (orders, query) => {
        if (!query || !orders) return orders.map(order => ({ ...order, searchContext: null }));
        
        const searchTerm = query.toLowerCase().trim();
        
        return orders.filter((order) => {
          let matchContext = null;
          
          // Search by order number
          if (order.orderNumber?.toLowerCase().includes(searchTerm)) {
            matchContext = { type: 'orderNumber', value: order.orderNumber };
            return true;
          }
          
          // Search by buyer name
          if (order.buyerName?.toLowerCase().includes(searchTerm)) {
            matchContext = { type: 'buyerName', value: order.buyerName };
            return true;
          }
          
          // Search by buyer email
          if (order.buyerEmail?.toLowerCase().includes(searchTerm)) {
            matchContext = { type: 'buyerEmail', value: order.buyerEmail };
            return true;
          }
          
          // Search by buyer phone number
          if (order.buyerPhoneNumber?.toLowerCase().includes(searchTerm)) {
            matchContext = { type: 'buyerPhone', value: order.buyerPhoneNumber };
            return true;
          }
          
          // Search by attendee names and emails
          const matchedAttendee = order.attendees?.find(attendee => {
            const fullName = `${attendee.firstName} ${attendee.lastName}`.toLowerCase();
            const email = attendee.email?.toLowerCase();
            return fullName.includes(searchTerm) || email?.includes(searchTerm);
          });
          
          if (matchedAttendee) {
            const fullName = `${matchedAttendee.firstName} ${matchedAttendee.lastName}`;
            const matchedField = fullName.toLowerCase().includes(searchTerm) ? 'name' : 'email';
            const matchedValue = matchedField === 'name' ? fullName : matchedAttendee.email;
            
            matchContext = { 
              type: 'attendee', 
              field: matchedField,
              value: matchedValue,
              attendeeCount: order.attendees?.length || 0
            };
            return true;
          }
          
          // Search by discount code
          if (order.discountCode?.code?.toLowerCase().includes(searchTerm)) {
            matchContext = { type: 'discountCode', value: order.discountCode.code };
            return true;
          }
          
          return false;
        }).map(order => {
          // Add search context to matched orders
          let searchContext = null;
          
          if (order.orderNumber?.toLowerCase().includes(searchTerm)) {
            searchContext = { type: 'orderNumber', value: order.orderNumber };
          } else if (order.buyerName?.toLowerCase().includes(searchTerm)) {
            searchContext = { type: 'buyerName', value: order.buyerName };
          } else if (order.buyerEmail?.toLowerCase().includes(searchTerm)) {
            searchContext = { type: 'buyerEmail', value: order.buyerEmail };
          } else if (order.buyerPhoneNumber?.toLowerCase().includes(searchTerm)) {
            searchContext = { type: 'buyerPhone', value: order.buyerPhoneNumber };
          } else if (order.discountCode?.code?.toLowerCase().includes(searchTerm)) {
            searchContext = { type: 'discountCode', value: order.discountCode.code };
          } else {
            // Check attendees
            const matchedAttendee = order.attendees?.find(attendee => {
              const fullName = `${attendee.firstName} ${attendee.lastName}`.toLowerCase();
              const email = attendee.email?.toLowerCase();
              return fullName.includes(searchTerm) || email?.includes(searchTerm);
            });
            
            if (matchedAttendee) {
              const fullName = `${matchedAttendee.firstName} ${matchedAttendee.lastName}`;
              const matchedField = fullName.toLowerCase().includes(searchTerm) ? 'name' : 'email';
              const matchedValue = matchedField === 'name' ? fullName : matchedAttendee.email;
              
              searchContext = { 
                type: 'attendee', 
                field: matchedField,
                value: matchedValue,
                attendeeCount: order.attendees?.length || 0
              };
            }
          }
          
          return { ...order, searchContext };
        });
      }
    }),
    {
      name: 'order-search-storage',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        statusFilter: state.statusFilter,
        priceSort: state.priceSort,
        dateRange: state.dateRange,
        page: state.page,
        rowsPerPage: state.rowsPerPage,
        selectedEventId: state.selectedEventId,
      }),
    }
  )
); 