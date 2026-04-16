import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { SugestaoCompra } from "@/compartilhado/servicos/servicoInventario";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { AlertCircle, ShoppingCart, ArrowRight, FileSpreadsheet, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { servicoExportacao } from "@/compartilhado/servicos/servicoExportacao";
import toast from "react-hot-toast";

interface ModalSugestoesCompraProps {
  aberto: boolean;
  aoFechar: () => void;
  sugestoes: SugestaoCompra[];
}

export function ModalSugestoesCompra({ aberto, aoFechar, sugestoes }: ModalSugestoesCompraProps) {
  const [copiado, setCopiado] = useState(false);
  const custoTotal = sugestoes.reduce((acc, s) => acc + s.custoEstimadoCentavos, 0);

  const exportarCSV = () => {
    const colunas = [
      { chave: "nome", rotulo: "Item" },
      { chave: "tipo", rotulo: "Tipo" },
      { chave: "quantidadeSugerida", rotulo: "Qtd Sugerida" },
      { chave: "unidade", rotulo: "Unidade" },
      { chave: "prioridade", rotulo: "Prioridade" },
      { chave: "custoEstimadoCentavos", rotulo: "Custo Estimado (Centavos)" },
    ];
    servicoExportacao.exportarCSV(sugestoes, colunas, `lista_compras_${new Date().toISOString().split("T")[0]}`);
    toast.success("CSV gerado com sucesso!");
  };

  const copiarWhatsApp = async () => {
    let texto = `*📦 LISTA DE COMPRAS - PRINTLOG*\n`;
    texto += `_Gerado em: ${new Date().toLocaleDateString("pt-BR")}_\n\n`;

    sugestoes.forEach((s) => {
      const prioridadeEmoji = s.prioridade === "Crítica" ? "🚨" : s.prioridade === "Alta" ? "⚠️" : "🛒";
      texto += `${prioridadeEmoji} *${s.nome}*\n`;
      texto += `└ Sugestão: ${s.quantidadeSugerida} ${s.tipo === "Material" ? "Rolo(s)" : s.unidade}\n`;
      texto += `└ Prioridade: ${s.prioridade}\n\n`;
    });

    texto += `*Total Estimado: ${centavosParaReais(custoTotal)}*`;

    const sucesso = await servicoExportacao.copiarParaAreaTransferencia(texto);
    if (sucesso) {
      setCopiado(true);
      toast.success("Copiado para o WhatsApp!");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Análise Preditiva de Compras" larguraMax="max-w-2xl">
      <div className="p-8 space-y-8 bg-white dark:bg-[#121214]">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
          <div className="p-2 bg-sky-500 text-white rounded-lg">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">
              Cesta Sugerida
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Baseado no seu consumo dos últimos 30 dias, estas aquisições são recomendadas para manter seu estúdio
              operando sem interrupções.
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sugestoes.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <p className="text-sm font-black uppercase tracking-widest">
                Estoque saudável. Nenhuma compra necessária.
              </p>
            </div>
          ) : (
            sugestoes.map((s, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={s.idItem}
                className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] group hover:border-sky-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${s.prioridade === "Crítica" ? "bg-rose-500 animate-pulse" : s.prioridade === "Alta" ? "bg-amber-500" : "bg-sky-500"}`}
                      />
                      <h5 className="text-sm font-black uppercase tracking-tight">{s.nome}</h5>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {s.tipo} • {s.quantidadeAtual}
                      {s.unidade} em estoque
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-md mb-2 inline-block ${
                        s.prioridade === "Crítica"
                          ? "bg-rose-500 text-white"
                          : s.prioridade === "Alta"
                            ? "bg-amber-500 text-white"
                            : "bg-sky-500/10 text-sky-500"
                      }`}
                    >
                      Prioridade {s.prioridade}
                    </div>
                    <p className="text-xs font-black text-gray-900 dark:text-white">
                      Faltam aprox. {s.diasRestantes} dias
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest underline decoration-sky-500/30">
                        Sugestão de Compra
                      </p>
                      <p className="text-sm font-black text-sky-500">
                        {s.quantidadeSugerida} {s.tipo === "Material" ? "Rolo(s)" : s.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Investimento Est.</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {centavosParaReais(s.custoEstimadoCentavos)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {sugestoes.length > 0 && (
          <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-6">
            <div className="flex justify-between w-full items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Total do Pedido Sugerido
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {centavosParaReais(custoTotal)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Atenção ao Fluxo de Caixa</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={exportarCSV}
                className="h-14 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <FileSpreadsheet size={16} />
                Planilha CSV
              </button>
              <button
                onClick={copiarWhatsApp}
                className="h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-500/20 transition-all border border-emerald-500/10"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
                {copiado ? "Copiado!" : "WhatsApp"}
              </button>
            </div>

            <button
              className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-xs tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10"
              onClick={aoFechar}
            >
              Fechar Análise
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Dialogo>
  );
}
