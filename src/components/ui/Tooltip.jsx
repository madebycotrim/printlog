import React from 'react';
import { HelpCircle } from 'lucide-react';

export const Tooltip = ({ text, children }) => {
    return (
        <div className="group/tooltip relative inline-flex items-center">
            {children || <HelpCircle size={12} className="text-zinc-500 cursor-help hover:text-sky-400 transition-colors" />}

            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block z-50 w-max max-w-xs">
                <div className="relative">
                    <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-[10px] text-zinc-300 leading-relaxed max-w-[200px] text-center">
                        {text}
                    </div>
                    {/* Seta do tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45 -mt-1"></div>
                </div>
            </div>
        </div>
    );
};
