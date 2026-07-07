import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Box } from "lucide-react";
import { InputBancario } from "@/compartilhado/componentes/ui";
import { ItemCustoFixo } from "../tipos";

/**
 * Interface para as propriedades do CardCustosFixos.
 */
interface PropriedadesCardCustosFixos {
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
  insumosFixos: number;
  setInsumosFixos: (v: number) => void;
  cobrarInsumosFixos: boolean;
  setCobrarInsumosFixos: (v: boolean) => void;
  itensCustosFixos: ItemCustoFixo[];
  setItensCustosFixos: (v: ItemCustoFixo[]) => void;
  modoEntrada?: 'unitario' | 'lote' | 'projeto';
}

/**
 * Card para registro de custos fixos adicionais (brindes, marketing, etc).
 */
export function CardCustosFixos({
  mostrar,
  setMostrar,
  insumosFixos,
  setInsumosFixos,
  cobrarInsumosFixos: _cobrarInsumosFixos,
  setCobrarInsumosFixos,
  itensCustosFixos,
  setItensCustosFixos,
  modoEntrada = 'lote'
}: PropriedadesCardCustosFixos) {
  const textoModo = modoEntrada === 'unitario' ? 'Unidade' : modoEntrada === 'projeto' ? 'Projeto' : 'Lote';

  const adicionarOpcao = (nome: string, valorCentavos: number) => {
    setItensCustosFixos([...itensCustosFixos, {
      id: crypto.randomUUID(),
      nome,
      valorCentavos
    }]);
  };
  return (
    <div className="flex flex-col my-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent border border-pink-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(217,70,239,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shadow-inner">
            <Wallet size={16} className={`${insumosFixos > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">Deseja adicionar custos fixos extras?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Brindes, mimos, marketing ou custos de gestão e embalagem</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            setCobrarInsumosFixos(novoEstado);
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-pink-500 text-white border-pink-600 shadow-sm shadow-pink-500/30 hover:bg-pink-600"
            : "bg-card text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-500/40 border-borda-sutil shadow-sm"
            }`}
        >
          {mostrar ? "Ocultar" : "Adicionar"}
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,var(--bg-card)_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden"
          >
            {/* Quininhas para preencher o gap dos cantos arredondados */}
            <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />
            <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />

            <div className="flex items-center justify-between pb-3 border-b border-borda-sutil mb-4">
              <div className="flex items-center gap-3">
                <Box size={16} className="text-pink-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-pink-500">Gestão de Custos Adicionais</h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Custo Adicional ({textoModo})</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xs font-black text-muted-foreground">R$</span>
                   <span className="text-lg font-black text-pink-600 dark:text-pink-400 tracking-tight leading-none">
                     {(_cobrarInsumosFixos ? (insumosFixos / 100) : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => adicionarOpcao("Embalagem", 200)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-pink-500 hover:border-pink-500/30 transition-all">+ Embalagem</button>
              <button onClick={() => adicionarOpcao("Adesivo/Mimo", 50)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-pink-500 hover:border-pink-500/30 transition-all">+ Mimo</button>
              <button onClick={() => adicionarOpcao("Personalizado", 0)} className="px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">+ Outro</button>
            </div>

            {itensCustosFixos.length === 0 ? (
              <div className="w-full border border-dashed border-borda-sutil rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-transparent opacity-60">
                <Box size={24} className="text-zinc-300 dark:text-zinc-700 mb-3" />
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">Nenhum custo fixo<br/>adicionado</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 mb-1">
                   <div className="flex-1"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</span></div>
                   <div className="w-28"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Valor (R$)</span></div>
                   <div className="w-8"></div>
                </div>

                {itensCustosFixos.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/20 dark:bg-white/[0.02] border border-borda-sutil rounded-xl group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={item.nome}
                        placeholder="Nome do custo..."
                        onChange={(e) => {
                          const novaLista = [...itensCustosFixos];
                          novaLista[index].nome = e.target.value;
                          setItensCustosFixos(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-borda-sutil text-[12px] font-black uppercase tracking-tight text-primary dark:text-white outline-none focus:border-pink-500 py-1 transition-colors px-1"
                      />
                    </div>

                    <div className="relative flex items-center w-28 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-lg focus-within:border-pink-500/50 focus-within:ring-2 focus-within:ring-pink-500/20 transition-all">
                      <span className="absolute left-2 text-[9px] font-black text-zinc-400">R$</span>
                      <InputBancario
                        placeholder="0,00"
                        value={item.valorCentavos || ""}
                        onChange={(e) => {
                          const novaLista = [...itensCustosFixos];
                          novaLista[index].valorCentavos = Number(e.target.value);
                          setItensCustosFixos(novaLista);
                        }}
                        className="w-full h-8 bg-transparent pl-7 pr-2 text-[12px] font-bold text-right text-primary dark:text-white outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setItensCustosFixos(itensCustosFixos.filter(i => i.id !== item.id));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
                
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-2 ml-1 text-center">
                  Estes valores serão somados ao custo final do projeto.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
