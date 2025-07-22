import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDataGridColumnsStore = create(
  persist(
    (set, get) => ({
      // Column widths by grid identifier
      columnWidths: {},
      
      // Actions
      setColumnWidth: (gridId, field, width) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [gridId]: {
              ...state.columnWidths[gridId],
              [field]: width,
            },
          },
        })),
      
      setColumnWidths: (gridId, widths) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [gridId]: {
              ...state.columnWidths[gridId],
              ...widths,
            },
          },
        })),
      
      getColumnWidth: (gridId, field) => {
        const state = get();
        return state.columnWidths[gridId]?.[field];
      },
      
      getColumnWidths: (gridId) => {
        const state = get();
        return state.columnWidths[gridId] || {};
      },
      
      resetColumnWidths: (gridId) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [gridId]: {},
          },
        })),
      
      resetAllColumnWidths: () =>
        set(() => ({
          columnWidths: {},
        })),
    }),
    {
      name: 'data-grid-columns-storage',
      partialize: (state) => ({
        columnWidths: state.columnWidths,
      }),
    }
  )
); 