import { LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PropriedadesAtalhoItem {
    titulo: string;
    subtitulo?: string;
    icone: LucideIcon;
    cor: string;
    link: string;
}

export function AtalhoItem({ titulo, subtitulo, icone: Icone, cor, link }: PropriedadesAtalhoItem) {
    const navegar = useNavigate();

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navegar(link)}
            className="flex items-center gap-5 p-5 rounded-[2rem] bg-white dark:bg-card border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all group w-full shadow-sm hover:shadow-xl dark:shadow-none relative overflow-hidden"
        >
            <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none`} />

            <div className={`w-14 h-14 shrink-0 rounded-2xl ${cor} flex items-center justify-center text-white shadow-2xl shadow-current/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                <Icone size={24} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col items-start min-w-0 flex-1 relative z-10">
                <span className="font-black text-[11px] uppercase tracking-[0.15em] text-gray-900 dark:text-white leading-tight mb-1">
                    {titulo}
                </span>
                {subtitulo && (
                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest truncate w-full text-left">
                        {subtitulo}
                    </span>
                )}
            </div>

            <div className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-zinc-700 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all">
                <ArrowRight size={14} strokeWidth={3} />
            </div>
        </motion.button>
    );
}
