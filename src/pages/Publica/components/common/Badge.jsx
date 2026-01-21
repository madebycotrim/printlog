import React from 'react';

export const Badge = ({ icon: Icon, label, color, className = "" }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors[color] || colors.sky} backdrop-blur-md w-fit ${className}`}>
            {Icon && <Icon size={12} strokeWidth={3} />}
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
        </div>
    );
};

export default Badge;
