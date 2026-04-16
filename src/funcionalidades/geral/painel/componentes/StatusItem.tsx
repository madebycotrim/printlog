import { motion } from "framer-motion";

interface PropriedadesStatusItem {
    titulo: string;
    maquina: string;
    progresso: number;
    status: string;
    cor: string;
}

export function StatusItem({ titulo, maquina, progresso, status, cor }: PropriedadesStatusItem) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{status}</p>
                    <h5 className="text-sm font-black dark:text-white">{maquina}</h5>
                    <p className="text-[10px] text-zinc-500">{titulo}</p>
                </div>
                <span className="text-lg font-black dark:text-white leading-none">{progresso}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${cor}`}
                />
            </div>
        </div>
    );
}
