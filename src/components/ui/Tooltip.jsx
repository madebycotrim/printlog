import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export const Tooltip = ({ text, content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top - 10, // Um pouco acima
                left: rect.left + (rect.width / 2)
            });
        }
    };

    const handleMouseEnter = () => {
        updatePosition();
        setIsVisible(true);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="group/tooltip relative inline-flex items-center w-full h-full justify-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children || <HelpCircle size={12} className="text-zinc-500 cursor-help hover:text-sky-400 transition-colors" />}
            </div>

            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none flex flex-col items-center"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="relative">
                        {content ? (
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl">
                                {content}
                            </div>
                        ) : (
                            <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl text-[10px] font-bold text-zinc-200 uppercase tracking-wider whitespace-nowrap">
                                {text}
                            </div>
                        )}
                        {/* Seta do tooltip - Ajustada para ser generica */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1"></div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
