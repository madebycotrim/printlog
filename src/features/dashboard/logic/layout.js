import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Base dimensions (w = col-span, h = row-span)
const WIDGET_DIMENSIONS = {
    financial: { w: 2, h: 1 },
    fleet_summary: { w: 2, h: 1 },
    alerts: { w: 1, h: 1 },
    todo: { w: 1, h: 2 },
    highlights: { w: 2, h: 1 },
    recent_projects: { w: 2, h: 2 },
    activity_feed: { w: 1, h: 2 },
    performance: { w: 1, h: 1 },
    material_stats: { w: 1, h: 2 },
    live_printers: { w: 1, h: 2 },
    revenue_chart: { w: 2, h: 1 },
    cost_distribution: { w: 2, h: 1 },
    smart_suggestions: { w: 1, h: 2 }
};

const getColClass = (w) => `lg:col-span-${w}`;
const getRowClass = (h) => h > 1 ? `lg:row-span-${h}` : '';

// Generate initial state from dimensions
const INITIAL_COL_SPANS = Object.fromEntries(
    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getColClass(dim.w)])
);
const INITIAL_ROW_SPANS = Object.fromEntries(
    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getRowClass(dim.h)])
);

export const useDashboardLayoutStore = create(
    persist(
        (set) => ({
            version: 13, // Bump for Bento Grid Layout
            editMode: false,
            // Initial Order: Status -> Workflow -> Insights
            layout: [
                // Top Row: Status & Finance
                'financial', 'fleet_summary',
                // Charts Row
                'revenue_chart', 'cost_distribution',
                // Mid Row: Workflow & Materials
                'recent_projects', 'material_stats', 'live_printers',
                // Bot Row: Insights & AI
                'smart_suggestions', 'performance', 'alerts'
            ],
            hidden: ['todo', 'activity_feed', 'highlights'], // Hidden by default
            expandedWidgets: [],
            colSpans: INITIAL_COL_SPANS,
            rowSpans: INITIAL_ROW_SPANS,
            customSizes: {}, // { id: { w: 1, h: 1 } }

            toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),

            // Manual Resize Action
            setWidgetSize: (id, width, height) => set((state) => {
                const newCustomSizes = {
                    ...state.customSizes,
                    [id]: { w: width, h: height }
                };

                const newColSpans = { ...state.colSpans };
                const newRowSpans = { ...state.rowSpans };

                // Apply new size
                newColSpans[id] = getColClass(width);
                if (height > 1) {
                    newRowSpans[id] = getRowClass(height);
                } else {
                    delete newRowSpans[id];
                }

                return {
                    customSizes: newCustomSizes,
                    colSpans: newColSpans,
                    rowSpans: newRowSpans,
                    // Remove from expanded if manually resized to avoid conflicts
                    expandedWidgets: state.expandedWidgets.filter(w => w !== id)
                };
            }),

            toggleExpand: (id) => set((state) => {
                const isExpanded = state.expandedWidgets.includes(id);
                const newExpanded = isExpanded
                    ? state.expandedWidgets.filter(w => w !== id)
                    : [...state.expandedWidgets, id];

                const newColSpans = { ...state.colSpans };
                const newRowSpans = { ...state.rowSpans };

                // If it has a custom size, use that as base, otherwise use default
                const customSize = state.customSizes[id];
                const baseDim = customSize || WIDGET_DIMENSIONS[id] || { w: 1, h: 1 };

                if (isExpanded) {
                    // Collapse: Restore Base/Custom Dimensions
                    newColSpans[id] = getColClass(baseDim.w);
                    newRowSpans[id] = getRowClass(baseDim.h);

                    // Cleanup empty row spans
                    if (!newRowSpans[id]) delete newRowSpans[id];

                } else {
                    // Expand: Double Dimensions (Smart Max)
                    // Width logic:
                    // 1 -> 2
                    // 2 -> 4 (Max)
                    const expandedW = Math.min(baseDim.w * 2, 4);

                    // Height logic:
                    // 1 -> 2
                    // 2 -> 2 (keep reasonable height usually, or 3 if really tall needed)
                    // For slots, doubling height usually effectively gives "full screen" feel
                    const expandedH = Math.min(baseDim.h * 2, 4);

                    newColSpans[id] = getColClass(expandedW);
                    newRowSpans[id] = getRowClass(expandedH);
                }

                return {
                    expandedWidgets: newExpanded,
                    colSpans: newColSpans,
                    rowSpans: newRowSpans
                };
            }),

            hideWidget: (id) => set((state) => ({
                layout: state.layout.filter(w => w !== id),
                hidden: [...state.hidden, id]
            })),

            showWidget: (id) => set((state) => ({
                hidden: state.hidden.filter(w => w !== id),
                layout: [...state.layout, id]
            })),

            moveWidget: (id, direction) => set((state) => {
                const index = state.layout.indexOf(id);
                if (index === -1) return state;
                const newLayout = [...state.layout];

                let targetIndex = index;
                if (direction === 'left') targetIndex = index - 1;
                else if (direction === 'right') targetIndex = index + 1;
                else if (direction === 'up') targetIndex = index - 4; // Grid cols 4
                else if (direction === 'down') targetIndex = index + 4;

                if (targetIndex < 0 || targetIndex >= newLayout.length) return state;

                const item = newLayout[index];
                const target = newLayout[targetIndex];
                newLayout[index] = target;
                newLayout[targetIndex] = item;

                return { layout: newLayout };
            }),

            reorderWidget: (sourceId, targetId) => set((state) => {
                const oldIndex = state.layout.indexOf(sourceId);
                const newIndex = state.layout.indexOf(targetId);
                if (oldIndex === -1 || newIndex === -1) return state;

                // 1. Resolve Sizes
                const getSize = (id) => state.customSizes[id] || WIDGET_DIMENSIONS[id] || { w: 1, h: 1 };
                // const sourceSize = getSize(sourceId);
                const targetSize = getSize(targetId);

                // 2. Prepare Updates
                const newCustomSizes = { ...state.customSizes };
                const newColSpans = { ...state.colSpans };
                const newRowSpans = { ...state.rowSpans };

                // 3. Smart Resize Logic
                // Source -> Adopts Target's Size (Fits perfectly in the new slot)
                newCustomSizes[sourceId] = targetSize;
                newColSpans[sourceId] = getColClass(targetSize.w);
                if (targetSize.h > 1) newRowSpans[sourceId] = getRowClass(targetSize.h);
                else delete newRowSpans[sourceId];

                // Target -> Resets to Default (Self-heals to avoid fragmentation)
                // We remove the strict custom size from the displaced widget so it can flow naturally
                delete newCustomSizes[targetId];
                const defaultTarget = WIDGET_DIMENSIONS[targetId] || { w: 1, h: 1 };
                newColSpans[targetId] = getColClass(defaultTarget.w);
                if (defaultTarget.h > 1) newRowSpans[targetId] = getRowClass(defaultTarget.h);
                else delete newRowSpans[targetId];

                // 4. Swap Positions
                const newLayout = [...state.layout];
                const [removed] = newLayout.splice(oldIndex, 1);
                newLayout.splice(newIndex, 0, removed);

                return {
                    layout: newLayout,
                    customSizes: newCustomSizes,
                    colSpans: newColSpans,
                    rowSpans: newRowSpans
                };
            }),



            resetLayout: () => {
                // Reconstruct initial dimensions to ensure no stale references
                const cleanColSpans = Object.fromEntries(
                    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getColClass(dim.w)])
                );
                const cleanRowSpans = Object.fromEntries(
                    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getRowClass(dim.h)])
                );

                set({
                    version: 14,
                    layout: [
                        'financial', 'fleet_summary',
                        'revenue_chart', 'cost_distribution',
                        'recent_projects', 'material_stats', 'live_printers',
                        'highlights', 'performance', 'alerts'
                    ],
                    colSpans: cleanColSpans,
                    rowSpans: cleanRowSpans,
                    customSizes: {},
                    hidden: ['todo', 'activity_feed'],
                    editMode: false,
                    expandedWidgets: []
                });
            },

            // Bulk Operations
            showAll: () => set((state) => ({
                layout: [...new Set([...state.layout, ...state.hidden])],
                hidden: []
            })),

            hideAll: () => set((state) => ({
                layout: [],
                hidden: [...new Set([...state.layout, ...state.hidden])]
            }))
        }),
        {
            name: 'dashboard-layout-storage',
            version: 11,
            migrate: (persistedState, version) => {
                const cleanColSpans = Object.fromEntries(
                    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getColClass(dim.w)])
                );
                const cleanRowSpans = Object.fromEntries(
                    Object.entries(WIDGET_DIMENSIONS).map(([id, dim]) => [id, getRowClass(dim.h)])
                );

                if (version < 13) {
                    return {
                        version: 13,
                        layout: [
                            'financial', 'fleet_summary',
                            'recent_projects', 'todo', 'activity_feed',
                            'highlights', 'performance', 'alerts'
                        ],
                        colSpans: cleanColSpans,
                        rowSpans: cleanRowSpans,
                        customSizes: {},
                        hidden: [],
                        editMode: false,
                        expandedWidgets: []
                    };
                }
                return persistedState;
            }
        }
    )
);
