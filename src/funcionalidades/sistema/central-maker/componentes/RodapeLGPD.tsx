import { ShieldCheck } from "lucide-react";

export function RodapeLGPD() {
    return (
        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" size={20} />
                <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                    O acesso à informação é um direito garantido pelo Art. 9º da LGPD. Todos os dados desta Wiki são de caráter técnico-educativo para usuários PrintLog.
                </p>
            </div>
            <p className="text-[10px] font-black text-gray-300 dark:text-white/10 uppercase tracking-[0.2em]">PRINTLOG_ENGINE_HELP</p>
        </div>
    );
}
