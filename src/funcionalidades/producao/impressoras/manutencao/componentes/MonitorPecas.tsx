import { PecaDesgaste } from "../tipos";
import { AlertTriangle } from "lucide-react";

interface MonitorPecasProps {
    pecas: PecaDesgaste[];
}

export function MonitorPecas({ pecas }: MonitorPecasProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Monitor de Desgaste
                </h3>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                    Base: Horímetro
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {pecas.map((peca) => {
                    const porcentagemUso = Math.min((peca.minutosUsoAtual / peca.vidaUtilEstimadaMinutos) * 100, 100);
                    const ehCritico = porcentagemUso > 90;
                    const ehAlerta = porcentagemUso > 75;

                    let corBarra = "bg-emerald-500";
                    if (ehCritico) corBarra = "bg-rose-500";
                    else if (ehAlerta) corBarra = "bg-amber-500";

                    return (
                        <div key={peca.id} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{peca.nome}</span>
                                    {ehCritico && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground">
                                    {Math.round(porcentagemUso)}% ({Math.floor(peca.minutosUsoAtual / 60)}h / {Math.floor(peca.vidaUtilEstimadaMinutos / 60)}h)
                                </span>
                            </div>

                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                                <div
                                    className={`h-full transition-all duration-1000 ${corBarra}`}
                                    style={{ width: `${porcentagemUso}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                <div className="text-amber-500 shrink-0">
                    <AlertTriangle size={18} />
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    Os valores são baseados no horímetro da máquina. Lembre-se de resetar o contador ao realizar a troca física da peça.
                </p>
            </div>
        </div>
    );
}
