import { FolderKanban, ChevronDown, Check, Plus, Box, LayoutGrid, Blocks, User, PencilLine, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Interface para as propriedades do CardIdentificacaoProjeto.
 */
interface PropriedadesCardIdentificacaoProjeto {
  buscaCliente: string;
  setBuscaCliente: (v: string) => void;
  abertoSeletorCliente: boolean;
  setAbertoSeletorCliente: (v: boolean) => void;
  clientes: any[];
  clienteId: string;
  setClienteId: (v: string) => void;
  criandoNovoCliente: boolean;
  aoCriarNovoCliente: (nome: string) => Promise<void>;
  nomeProjeto: string;
  setNomeProjeto: (v: string) => void;
  descricaoProjeto: string;
  setDescricaoProjeto: (v: string) => void;
  modoEntrada: 'unitario' | 'lote' | 'projeto';
  setModoEntrada: (v: 'unitario' | 'lote' | 'projeto') => void;
  quantidade: number;
}

/**
 * Card de identificação do projeto, cliente e detalhes técnicos.
 */
export function CardIdentificacaoProjeto({
  buscaCliente,
  setBuscaCliente,
  abertoSeletorCliente,
  setAbertoSeletorCliente,
  clientes,
  clienteId,
  setClienteId,
  criandoNovoCliente,
  aoCriarNovoCliente,
  nomeProjeto,
  setNomeProjeto,
  descricaoProjeto,
  setDescricaoProjeto,
  modoEntrada,
  setModoEntrada,
  quantidade
}: PropriedadesCardIdentificacaoProjeto) {
  return (
    <div className={`h-full p-5 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-4 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-blue ${abertoSeletorCliente ? 'z-50' : 'z-10'}`}>
      {/* Efeito Glow Azul de Fundo (Fixo) */}
      <motion.div 
        animate={{ 
          backgroundColor: 'rgba(14, 165, 233, 0.06)',
          right: modoEntrada === 'unitario' ? '-40px' : '40px',
          scale: modoEntrada === 'unitario' ? 1 : 1.2
        }}
        className="absolute -top-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000" 
      />

      <div className="relative z-10 flex items-center justify-between border-b border-borda-sutil pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#3b82f6] border border-[#3b82f6]/30">
            <FolderKanban size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Identificação do Orçamento</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Vincule o cliente e os detalhes técnicos</span>
          </div>
        </div>
      </div>

      <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        {/* Lado Esquerdo: Dados do Cliente */}
        <div className="md:col-span-4 flex flex-col gap-2 relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 ml-1">Cliente do Projeto</label>

          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.03] border border-borda-sutil focus-within:border-blue-500/50 focus-within:bg-blue-500/[0.02] rounded-xl shadow-inner h-12 transition-all overflow-hidden">
            <div className="absolute left-4 text-zinc-400 dark:text-zinc-600 focus-within:text-blue-500">
               <User size={16} />
            </div>
            <input
              type="text"
              placeholder="Inserir ou buscar cliente..."
              value={buscaCliente || ""}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setAbertoSeletorCliente(true);
              }}
              onFocus={() => setAbertoSeletorCliente(true)}
              className="w-full h-full bg-transparent pl-12 pr-10 font-bold text-xs text-primary dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => setAbertoSeletorCliente(!abertoSeletorCliente)}
              className="absolute right-3 text-zinc-400 dark:text-zinc-600 hover:text-primary dark:hover:text-white transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform duration-300 ${abertoSeletorCliente ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {abertoSeletorCliente && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={() => setAbertoSeletorCliente(false)} />
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white dark:bg-[#0c0c0e]/95 border border-borda-sutil dark:border-white/10 rounded-xl shadow-2xl p-2 z-[100] flex flex-col gap-1 max-h-60 overflow-y-auto backdrop-blur-2xl">
                {(() => {
                  const buscaValida = (buscaCliente || "").toLowerCase();
                  const filtrados = (clientes || []).filter(c =>
                    (c.nome || "").toLowerCase().includes(buscaValida)
                  );
                  const clienteExato = filtrados.some(c => (c.nome || "").toLowerCase() === buscaValida.trim());

                  return (
                    <>
                      {filtrados.map((cli) => (
                        <button
                          key={cli.id}
                          type="button"
                          onClick={() => {
                            setClienteId(cli.id);
                            setBuscaCliente(cli.nome);
                            setAbertoSeletorCliente(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between ${clienteId === cli.id
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'
                            }`}
                        >
                          <span>{cli.nome}</span>
                          {clienteId === cli.id && <Check size={14} />}
                        </button>
                      ))}

                      {buscaCliente.trim() !== '' && !clienteExato && (
                        <button
                          type="button"
                          disabled={criandoNovoCliente}
                          onClick={() => aoCriarNovoCliente(buscaCliente.trim())}
                          className="w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 transition-colors flex items-center gap-2 border border-dashed border-borda-sutil dark:border-zinc-500/20"
                        >
                          <Plus size={14} />
                          {criandoNovoCliente ? 'Criando...' : `Criar "${buscaCliente}"`}
                        </button>
                      )}

                      {filtrados.length === 0 && buscaCliente.trim() === '' && (
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider text-center py-2">
                          Nenhum cliente cadastrado
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>

        {/* Lado Direito: Nome e Descrição */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 ml-1">Nome do Projeto</label>
            <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.03] border border-borda-sutil focus-within:border-blue-500/50 focus-within:bg-blue-500/[0.02] rounded-xl shadow-inner h-12 transition-all overflow-hidden">
               <div className="absolute left-4 text-zinc-400 dark:text-zinc-600">
                  <PencilLine size={16} />
               </div>
               <input
                 type="text"
                 placeholder="Ex: Action Figure Batman"
                 value={nomeProjeto}
                 onChange={(e) => setNomeProjeto(e.target.value)}
                 className="w-full h-full bg-transparent pl-12 pr-4 font-bold text-xs text-primary dark:text-white outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
               />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 ml-1">Observações Técnicas</label>
            <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.03] border border-borda-sutil focus-within:border-blue-500/50 focus-within:bg-blue-500/[0.02] rounded-xl shadow-inner h-12 transition-all overflow-hidden">
               <div className="absolute left-4 text-zinc-400 dark:text-zinc-600">
                  <MessageSquare size={16} />
               </div>
               <input
                 type="text"
                 placeholder="Ex: Altura de camada 0.12mm"
                 value={descricaoProjeto}
                 onChange={(e) => setDescricaoProjeto(e.target.value)}
                 className="w-full h-full bg-transparent pl-12 pr-4 font-bold text-xs text-primary dark:text-white outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Estratégia: Cards Interativos */}
      <div className="relative z-10 pt-4 border-t border-borda-sutil flex flex-col gap-4 mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Estratégia de Preenchimento</span>
          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mt-0.5">Selecione como a inteligência deve processar os dados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card: Por Peça */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setModoEntrada('unitario')}
            className={`relative p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 text-left overflow-hidden ${
              modoEntrada === 'unitario' 
              ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
              : 'bg-zinc-50 dark:bg-zinc-950/40 border-borda-sutil hover:border-blue-500/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              modoEntrada === 'unitario' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 border border-borda-sutil'
            }`}>
              <Box size={20} />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                modoEntrada === 'unitario' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}>Peça Única</span>
              <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight uppercase tracking-tighter">
                Valores equivalem a 1 peça isolada. O total será multiplicado por <span className={modoEntrada === 'unitario' ? 'text-blue-500' : ''}>{quantidade || 'X'}{quantidade ? 'x' : ''}</span>.
              </p>
            </div>

            {modoEntrada === 'unitario' && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"
              />
            )}
          </motion.button>

          {/* Card: Mesa Completa */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setModoEntrada('lote')}
            className={`relative p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 text-left overflow-hidden ${
              modoEntrada === 'lote' 
              ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
              : 'bg-zinc-50 dark:bg-zinc-950/40 border-borda-sutil hover:border-blue-500/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              modoEntrada === 'lote' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 border border-borda-sutil'
            }`}>
              <LayoutGrid size={20} />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                modoEntrada === 'lote' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}>Mesa / Lote</span>
              <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight uppercase tracking-tighter">
                Valores equivalem a impressão de todas as <span className={modoEntrada === 'lote' ? 'text-blue-500' : ''}>{quantidade || 'X'} {quantidade === 1 ? 'peça' : 'peças'}</span> de uma única vez.
              </p>
            </div>

            {modoEntrada === 'lote' && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"
              />
            )}
          </motion.button>

          {/* Card: Projeto/Montagem */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setModoEntrada('projeto')}
            className={`relative p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 text-left overflow-hidden ${
              modoEntrada === 'projeto' 
              ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
              : 'bg-zinc-50 dark:bg-zinc-950/40 border-borda-sutil hover:border-blue-500/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              modoEntrada === 'projeto' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 border border-borda-sutil'
            }`}>
              <Blocks size={20} />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                modoEntrada === 'projeto' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}>Projeto Multipeças</span>
              <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight uppercase tracking-tighter">
                Valores equivalem a soma de várias partes de 1 projeto. O total será multiplicado por <span className={modoEntrada === 'projeto' ? 'text-blue-500' : ''}>{quantidade || 'X'}{quantidade ? 'x' : ''}</span>.
              </p>
            </div>

            {modoEntrada === 'projeto' && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
