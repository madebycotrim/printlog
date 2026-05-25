import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { decodificarLinkMagico } from "@/compartilhado/utilitarios/link-magico";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { Check, Clock, Box, ShieldCheck, ArrowRight, Printer, ThumbsUp, ThumbsDown, User, FileText, CheckCircle2 } from "lucide-react";
import { useArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";
import { TipoNotificacao, CategoriaNotificacao } from "@/compartilhado/tipos/notificacoes";
import { motion, AnimatePresence } from "framer-motion";

export function PaginaOrcamentoPublico() {
  const [searchParams] = useSearchParams();
  const hash = searchParams.get("q");

  // Estado local para controle da aprovação: 'pendente' | 'aprovado' | 'recusado'
  const [statusAprovacao, setStatusAprovacao] = useState<'pendente' | 'aprovado' | 'recusado'>('pendente');

  const dados = useMemo(() => {
    if (!hash) return null;
    return decodificarLinkMagico(hash);
  }, [hash]);

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center flex flex-col items-center gap-4">
          <ShieldCheck size={48} className="text-zinc-700" />
          <h1 className="text-xl font-black uppercase tracking-wider">Orçamento Inválido</h1>
          <p className="text-sm text-zinc-400">Este link mágico parece estar quebrado ou incompleto. Solicite um novo link ao seu fornecedor.</p>
        </div>
      </div>
    );
  }

  const { pr, np, t, m, e, s, w, id, cli, obs } = dados;
  const diasSugeridos = Math.ceil(t / 60 / 12) + 1; // Estimativa conservadora de prazo
  const estudioNome = e || "Estúdio de Impressão 3D";
  const nomeClienteExibicao = cli || "Cliente Especial";

  const lidarComAprovacao = () => {
    setStatusAprovacao('aprovado');
    
    // Adiciona notificação para o Maker no painel
    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Aprovado: ${np}`,
      mensagem: `O cliente ${nomeClienteExibicao} acabou de aprovar o orçamento no valor de ${centavosParaReais(pr)}.`,
      tipo: TipoNotificacao.SUCESSO,
      categoria: CategoriaNotificacao.PEDIDOS,
      link: id ? `/producao?busca=${id}` : "/producao"
    });
  };

  const lidarComRecusa = () => {
    setStatusAprovacao('recusado');
    
    // Adiciona notificação para o Maker no painel
    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Recusado: ${np}`,
      mensagem: `O cliente ${nomeClienteExibicao} não aceitou a proposta de ${centavosParaReais(pr)}.`,
      tipo: TipoNotificacao.AVISO,
      categoria: CategoriaNotificacao.PEDIDOS
    });
  };

  const mensagemWhatsBase = statusAprovacao === 'aprovado' 
    ? `Olá! Estou verificando o orçamento mágico para *${np}* e **APROVO** o pedido no valor de R$ ${(pr / 100).toFixed(2).replace('.', ',')}. Como podemos prosseguir?`
    : `Olá! Estou verificando o orçamento mágico para *${np}* no valor de R$ ${(pr / 100).toFixed(2).replace('.', ',')}. Tenho algumas dúvidas, podemos conversar?`;

  const linkWhats = w ? `https://wa.me/55${w.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemWhatsBase)}` : null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-sky-500/30 font-sans">
      {/* Header Premium */}
      <header className="w-full p-6 flex flex-col items-center justify-center border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-sky-500/10">
          <Printer size={24} />
        </div>
        <h1 className="text-lg font-black uppercase tracking-widest text-zinc-100">{estudioNome}</h1>
        {s && <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1">{s}</p>}
      </header>

      {/* Corpo */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-8 flex flex-col gap-6 relative">
        
        <AnimatePresence mode="wait">
          {statusAprovacao === 'pendente' && (
            <motion.div 
              key="pendente"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* Apresentação do Cliente */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Proposta para</p>
                  <p className="text-sm font-bold text-zinc-200">{nomeClienteExibicao}</p>
                </div>
              </div>

              {/* Card Principal de Preço */}
              <div className="relative p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none" />
                
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <FileText size={14} /> Detalhes do Projeto
                </span>
                <h2 className="text-2xl font-black text-zinc-100 mb-2 leading-tight">{np}</h2>
                
                <div className="flex items-baseline gap-2 mt-6 mb-2">
                  <span className="text-xl font-bold text-zinc-500">R$</span>
                  <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                    {(pr / 100).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full mt-2">
                  Pronto para produção
                </span>
              </div>

              {/* Detalhes Técnicos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Prazo Est.</span>
                  </div>
                  <span className="text-lg font-black text-zinc-200">{diasSugeridos} a {diasSugeridos + 2} dias</span>
                </div>

                <div className="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Box size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Material</span>
                  </div>
                  <span className="text-sm font-black text-zinc-200 leading-tight">
                    {m.length > 0 ? m.join(', ') : 'Resina / Filamento'}
                  </span>
                </div>
              </div>

              {/* Observações da Proposta */}
              {obs && (
                <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Observações Adicionais</span>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{obs}</p>
                </div>
              )}

              {/* Check de Qualidade */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/30 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check size={16} className="text-sky-500" />
                  <span className="text-xs font-bold">Impressão 3D de alta precisão</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check size={16} className="text-sky-500" />
                  <span className="text-xs font-bold">Acabamento e pós-processamento inclusos</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check size={16} className="text-sky-500" />
                  <span className="text-xs font-bold">Garantia estrutural da peça</span>
                </div>
              </div>

              {/* Ações de Aprovação */}
              <div className="mt-4 flex flex-col gap-3">
                <button 
                  onClick={lidarComAprovacao}
                  className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 group"
                >
                  <ThumbsUp size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Aprovar Orçamento</span>
                </button>
                
                <button 
                  onClick={lidarComRecusa}
                  className="w-full h-14 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                >
                  <ThumbsDown size={14} />
                  <span>Recusar Orçamento</span>
                </button>
                
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center mt-2">
                  Orçamento válido por 7 dias. Ao aprovar, o estúdio será notificado imediatamente.
                </span>
              </div>
            </motion.div>
          )}

          {statusAprovacao === 'aprovado' && (
            <motion.div 
              key="aprovado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 mt-10"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 shadow-[0_0_60px_-10px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-white">Parabéns!</h2>
              <p className="text-zinc-400 text-sm max-w-[280px]">
                O estúdio foi notificado da sua aprovação. Para alinhar pagamento e entrega, chame o fornecedor no WhatsApp.
              </p>

              {linkWhats && (
                <a 
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full max-w-sm h-16 mt-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98] shadow-xl shadow-[#25D366]/20"
                >
                  <span>Falar no WhatsApp</span>
                  <ArrowRight size={18} />
                </a>
              )}
            </motion.div>
          )}

          {statusAprovacao === 'recusado' && (
            <motion.div 
              key="recusado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 mt-10"
            >
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                <ThumbsDown size={32} className="text-zinc-500" />
              </div>
              <h2 className="text-2xl font-black text-white">Proposta Recusada</h2>
              <p className="text-zinc-400 text-sm max-w-[280px]">
                O fornecedor foi notificado sobre sua decisão. Se preferir, você pode enviar uma mensagem informando o motivo.
              </p>

              {linkWhats && (
                <a 
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full max-w-sm h-14 mt-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                >
                  <span>Falar com o fornecedor</span>
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
