import React, { useMemo } from "react";
import { Plus } from "lucide-react";

/**
 * A shared component to display items grouped by category/material in a "Virtual Shelf" layout.
 * Supports both Grid and List views.
 * 
 * @param {Object} props
 * @param {Object} props.groups - The grouped data object { "CategoryName": [items...] }
 * @param {Function} props.renderItem - Function to render individual items: (item) => <Component />
 * @param {Function} props.onAdd - Function called when clicking the "Add" button: (groupKey) => void
 * @param {string} props.viewMode - 'grid' or 'list'
 * @param {string} props.emptyMessage - Message to show if no groups
 */
export const VirtualShelves = ({
    groups,
    renderItem,
    onAdd,
    viewMode = 'grid',
    emptyMessage = "No items found",
}) => {
    // Safety check
    if (!groups || typeof groups !== 'object') {
        return null;
    }

    const groupKeys = Object.keys(groups);

    if (groupKeys.length === 0) {
        return null; // Let the parent handle the empty state globally if needed, or render nothing here.
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {Object.entries(groups).map(([groupName, items]) => (
                <div key={groupName} className="relative group/shelf pt-4">

                    {/* Shelf Header */}
                    <div className="flex items-baseline gap-4 mb-4 ml-2">
                        {/* Background Giant Text */}
                        <h2 className="text-4xl font-black text-zinc-800/50 uppercase tracking-tighter select-none absolute -top-2 -left-4 -z-10 group-hover/shelf:text-zinc-800 transition-colors duration-500 pointer-events-none">
                            {groupName}
                        </h2>

                        {/* Foreground Header */}
                        <div className="flex items-center gap-4 relative z-10 w-full pr-4">
                            <span className="text-2xl font-bold text-zinc-100 tracking-tight">{groupName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {items.length} {items.length === 1 ? 'Item' : 'Itens'}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent min-w-[50px]" />
                        </div>
                    </div>

                    {/* Shelf Content */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                            {items.map(item => (
                                <div key={item.id || item._id}>
                                    {renderItem(item)}
                                </div>
                            ))}

                            {/* Add Button (Grid Slot) */}
                            {onAdd && (
                                <button
                                    onClick={() => onAdd(groupName)}
                                    className="group flex flex-col items-center justify-center w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-zinc-800 group-hover:border-zinc-500 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        <Plus size={24} className="text-zinc-600 group-hover:text-zinc-200" />
                                    </div>
                                    <span className="mt-4 text-xs font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">
                                        Adicionar
                                    </span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {items.map(item => (
                                <div key={item.id || item._id}>
                                    {renderItem(item)}
                                </div>
                            ))}

                            {/* Add Button (List Row) */}
                            {onAdd && (
                                <button
                                    onClick={() => onAdd(groupName)}
                                    className="w-full h-12 rounded-xl border-2 border-dashed border-zinc-800/50 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/30 flex items-center justify-center gap-3 transition-all group mt-2"
                                >
                                    <Plus size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">
                                        Adicionar em {groupName}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
