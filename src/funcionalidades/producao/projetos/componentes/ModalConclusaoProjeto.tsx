import { useState, useMemo } from "react";
import { Dialogo } from "@/compartilhado/componentes";
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { Pedido } from "../tipos";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropsModalConclusao {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
  aoConfirmar: (perdas: Record<string, number>, gerarReceitaFinanceira: boolean) => void;
}

export function ModalConclusaoProjeto({ aberto, aoFechar, pedido, aoConfirmar }: PropsModalConclusao) {
  const materiaisEstoque = useArmazemMateriais((s) => s.materiais);
  const [houveFalha, setHouveFalha] = useState<boolean | null>(null);
  
  // Mapeia o id do material para a quantidade de gramas perdidas
  const [perdas, setPerdas] = useState<Record<string, number>>({});
  const [gerarReceitaFinanceira, setGerarReceitaFinanceira] = useState(true);

  // 1. Identifica quais materiais associar ao projeto
  const materiaisAssociados = useMemo(() => {
    if (!pedido) return [];
    
    // Caso 1: Detalhado (materiais cadastrados no projeto)
    if (pedido.materiais && pedido.materiais.length > 0) {
      return pedido.materiais.map(m => {
        const est = materiaisEstoque.find(e => e.id === m.idMaterial);
        return {
          id: m.idMaterial,
          nome: m.nome,
          pesoMaximo: m.quantidadeGasta,
          precoKgCentavos: est?.precoCentavos || 15000 // Fallback
        };
      });
    }

    // Caso 2: Legado (apenas nome textual do material)
    if (pedido.material) {
      const match = materiaisEstoque.find(e => 
        e.nome.toLowerCase().includes(pedido.material!.toLowerCase()) ||
        pedido.material!.toLowerCase().includes(e.nome.toLowerCase())
      );
      if (match) {
        return [{
          id: match.id,
          nome: match.nome,
          pesoMaximo: pedido.pesoGramas || 0,
          precoKgCentavos: match.precoCentavos
        }];
      }
    }

    // Caso 3: Sem materiais ou sem match. Retorna o primeiro favorito ou geral do estoque
    const favorito = materiaisEstoque.find(m => m.favorito) || materiaisEstoque[0];
    if (favorito) {
      return [{
        id: favorito.id,
        nome: favorito.nome,
        pesoMaximo: pedido.pesoGramas || 0,
        precoKgCentavos: favorito.precoCentavos
      }];
    }

    return [];
  }, [pedido, materiaisEstoque]);

  if (!pedido) return null;

  const lidarComConfirmacao = () => {
    aoConfirmar(perdas, gerarReceitaFinanceira);
  };

  const calcularCustoPerda = (idMaterial: string, gramas: number) => {
    const mat = materiaisAssociados.find(m => m.id === idMaterial);
    if (!mat) return 0;
    const custoPorGrama = mat.precoKgCentavos / 1000;
    return Math.round(gramas * custoPorGrama);
  };

  const totalPerdaCentavos = Object.entries(perdas).reduce((acc, [id, g]) => acc + calcularCustoPerda(id, g), 0);

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Conclusão de Impressão"
      larguraMax="max-w-lg"
    >
      <div className="p-8 flex flex-col items-center">
        {/* Ícone de Sucesso Principal */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <CheckCircle2 size={32} strokeWidth={1.5} />
        </div>

        <h2 className="text-xl font-black text-primary uppercase tracking-tight text-center mb-1">
          Finalizar Projeto
        </h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-6 truncate max-w-sm">
          {pedido.descricao}
        </p>

        {houveFalha === null ? (
          <div className="w-full space-y-6">
            <div className="bg-muted/30 border border-borda-sutil rounded-2xl p-4 text-center">
              <p className="text-xs text-secondary leading-relaxed font-semibold">
                A impressão desse projeto ocorreu com sucesso de primeira ou houve perda de filamento/sucata antes do sucesso?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setHouveFalha(false)}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer group active:scale-95 text-center"
              >
                <Sparkles size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sucesso de Primeira</span>
                <span className="text-[8px] opacity-70 mt-1 uppercase font-semibold">Sem desperdício de material</span>
              </button>

              <button
                onClick={() => setHouveFalha(true)}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-500 transition-all cursor-pointer group active:scale-95 text-center"
              >
                <AlertTriangle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Houve Perda / Falha</span>
                <span className="text-[8px] opacity-70 mt-1 uppercase font-semibold">Registrar sucata no painel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {houveFalha && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Informe a quantidade de material perdida nas tentativas falhas:</span>
                </div>

                <div className="space-y-6">
                  {materiaisAssociados.map((mat) => {
                    const valorAtual = perdas[mat.id] || 0;
                    const pesoMax = mat.pesoMaximo || 200; // Gramas máximas estimadas para controle do slider
                    const pct = pesoMax > 0 ? Math.min(100, Math.round((valorAtual / pesoMax) * 100)) : 0;

                    const lidarComMudancaGrama = (gramas: number) => {
                      setPerdas(prev => ({
                        ...prev,
                        [mat.id]: Math.max(0, gramas)
                      }));
                    };

                    return (
                      <div key={mat.id} className="p-5 rounded-2xl bg-muted/20 border border-borda-sutil space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-secondary truncate max-w-[200px]">
                            {mat.nome}
                          </span>
                          <div className="flex items-center gap-1.5 bg-muted/40 border border-borda-sutil px-2.5 py-1 rounded-xl">
                            <input
                              type="number"
                              min="0"
                              value={valorAtual || ""}
                              onChange={(e) => lidarComMudancaGrama(e.target.value === "" ? 0 : Number(e.target.value))}
                              className="w-12 text-center bg-transparent outline-none text-xs font-black text-primary"
                              placeholder="0"
                            />
                            <span className="text-[10px] font-bold text-muted-foreground">g</span>
                          </div>
                        </div>

                        {pesoMax > 0 && (
                          <div className="space-y-2">
                            <input
                              type="range"
                              min="0"
                              max={pesoMax}
                              value={valorAtual}
                              onChange={(e) => lidarComMudancaGrama(Number(e.target.value))}
                              className="w-full accent-rose-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                              <span>0%</span>
                              <span>{pct}% ({valorAtual}g de {pesoMax}g)</span>
                              <span>100%</span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Prejuízo Estimado:</span>
                          <span className="text-rose-500 font-extrabold">{centavosParaReais(calcularCustoPerda(mat.id, valorAtual))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPerdaCentavos > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-rose-500">
                    <span>Custo Total da Sucata:</span>
                    <span>{centavosParaReais(totalPerdaCentavos)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border mt-4">
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors border border-border/50">
                <input
                  type="checkbox"
                  checked={gerarReceitaFinanceira}
                  onChange={(e) => setGerarReceitaFinanceira(e.target.checked)}
                  className="w-4 h-4 rounded border-input bg-background accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-primary">Lançar no Financeiro</span>
                  <span className="text-[9px] font-medium text-muted-foreground mt-0.5">Criar receita com o valor do projeto ({pedido?.valorCentavos ? centavosParaReais(pedido.valorCentavos) : "R$ 0,00"})</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => {
                  setHouveFalha(null);
                  setPerdas({});
                }}
                className="px-6 py-3.5 rounded-xl bg-muted/40 hover:bg-muted text-secondary text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={lidarComConfirmacao}
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Confirmar & Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialogo>
  );
}
