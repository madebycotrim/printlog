import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const presets = {
    today: {
        label: 'Hoje',
        getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) })
    },
    last7days: {
        label: 'Últimos 7 dias',
        getValue: () => ({ from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) })
    },
    last30days: {
        label: 'Últimos 30 dias',
        getValue: () => ({ from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) })
    },
    thisMonth: {
        label: 'Este mês',
        getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    },
    lastMonth: {
        label: 'Mês passado',
        getValue: () => {
            const lastMonth = subMonths(new Date(), 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        }
    },
    all: {
        label: 'Tudo',
        getValue: () => ({ from: null, to: null })
    }
};

export const useDateRangeStore = create(
    persist(
        (set) => ({
            preset: 'last30days',
            customRange: { from: null, to: null },

            setPreset: (preset) => set({ preset, customRange: { from: null, to: null } }),

            setCustomRange: (from, to) => set({ preset: 'custom', customRange: { from, to } }),

            getActiveRange: () => {
                const state = useDateRangeStore.getState();
                if (state.preset === 'custom') {
                    return state.customRange;
                }
                return presets[state.preset]?.getValue() || presets.all.getValue();
            }
        }),
        {
            name: 'dashboard-date-range'
        }
    )
);

export { presets };

// Hook for filtering data by date range
export const useFilteredByDate = (data, dateField = 'createdAt') => {
    const range = useDateRangeStore(state => state.getActiveRange());

    if (!data || !Array.isArray(data)) return [];
    if (!range.from && !range.to) return data;

    return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        if (range.from && itemDate < range.from) return false;
        if (range.to && itemDate > range.to) return false;
        return true;
    });
};
