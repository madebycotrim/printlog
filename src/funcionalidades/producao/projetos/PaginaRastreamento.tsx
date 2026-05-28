import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Truck, 
  Activity,
  AlertCircle,
  Link2
} from "lucide-react";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { formatarDataCurta } from "@/compartilhado/utilitarios/formatadores";
import { Carregamento } from "@/compartilhado/componentes";

interface PublicPedido {
  id: string;
  status: StatusPedido;
  descricao: string;
  dataCriacao: string;
  dataConclusao?: string;
  material?: string;
  pesoGramas?: number;
  tempoMinutos?: number;
  observacoesPublicas?: string;
  codigoRastreio?: string;
  fotosProgresso?: string[];
}

export function PaginaRastreamento() {
  const { idPedido } = useParams<{ idPedido: string }>();
  const [pedido, setPedido] = useState<PublicPedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarDados = async () => {
      if (!idPedido) return;
      try {
        const resposta = await fetch(`/api/publico/pedido?id=${idPedido}`);
        if (!resposta.ok) {
          throw new Error("Pedido não encontrado ou ID inválido.");
        }
        const dados = await resposta.json();
        setPedido(dados);
      } catch (err: any) {
        setErro(err.message || "Erro ao carregar dados de rastreamento.");
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, [idPedido]);

  // Passos de Progresso
  const passos = [
    { status: StatusPedido.A_FAZER, rotulo: "Aprovado", descricao: "Pedido recebido e confirmado" },
    { status: StatusPedido.EM_PRODUCAO, rotulo: "Imprimindo", descricao: "A peça está na impressora" },
    { status: StatusPedido.ACABAMENTO, rotulo: "Acabamento", descricao: "Remoção de suportes e pós-processamento" },
    { status: StatusPedido.CONCLUIDO, rotulo: "Pronto", descricao: "Pronto para envio ou retirada" }
  ];

  const obterIndiceStatus = (statusAtual: StatusPedido) => {
    switch (statusAtual) {
      case StatusPedido.A_FAZER: return 0;
      case StatusPedido.EM_PRODUCAO: return 1;
      case StatusPedido.ACABAMENTO: return 2;
      case StatusPedido.CONCLUIDO: return 3;
      default: return 0;
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e] p-6">
        <Carregamento tipo="ponto" mensagem="Buscando status do seu projeto..." />
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e] p-6 text-center">
        <div className="max-w-md p-8 bg-card border border-borda-sutil rounded-[2rem] shadow-xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-black text-primary dark:text-white uppercase tracking-widest">
            Rastreamento Indisponível
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {erro || "Não foi possível carregar os dados do pedido informado. Verifique se o link está correto."}
          </p>
        </div>
      </div>
    );
  }

  const indiceAtivo = obterIndiceStatus(pedido.status);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 flex flex-col items-center py-16 px-4">
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        {/* Header da Landing de Rastreio */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primaria/10 border border-primaria/20 text-[9px] font-black text-primaria uppercase tracking-widest">
            <Activity size={10} className="animate-pulse" /> Acompanhamento Online
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-primary dark:text-white uppercase">
            Status do Pedido
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ID: <span className="font-mono">{pedido.id}</span>
          </p>
        </div>

        {/* Card Principal do Pedido */}
        <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 shadow-xl space-y-8">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
              Descrição do Item
            </span>
            <h3 className="text-lg font-black text-primary dark:text-white uppercase leading-tight mt-1">
              {pedido.descricao}
            </h3>
          </div>

          {/* Timeline de Status */}
          <div className="space-y-6 pt-4">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block">
              Histórico de Etapas
            </span>
            
            <div className="relative pl-6 border-l border-zinc-200 dark:border-white/10 space-y-8">
              {passos.map((passo, index) => {
                const completo = index <= indiceAtivo;
                const ativo = index === indiceAtivo;

                return (
                  <div key={passo.status} className="relative">
                    {/* Indicador Bullet */}
                    <div className={`
                      absolute -left-[31px] top-0 w-[11px] h-[11px] rounded-full border-2 transition-all duration-500
                      ${completo 
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                        : "bg-card border-zinc-300 dark:border-white/15"}
                    `} />

                    <div className="space-y-1">
                      <h4 className={`text-xs font-black uppercase tracking-wider ${
                        ativo ? "text-primaria" : completo ? "text-primary dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"
                      }`}>
                        {passo.rotulo}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {passo.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes Técnicos Básicos */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-borda-sutil/60 text-xs">
            {pedido.material && (
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-white/[0.01] border border-borda-sutil/60">
                <span className="text-[8px] font-black uppercase text-zinc-400 block mb-1">Insumo Utilizado</span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{pedido.material}</span>
              </div>
            )}
            <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-white/[0.01] border border-borda-sutil/60">
              <span className="text-[8px] font-black uppercase text-zinc-400 block mb-1">Data de Início</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatarDataCurta(new Date(pedido.dataCriacao))}</span>
            </div>
          </div>

          {/* Seção de Rastreio de Postagem */}
          {pedido.codigoRastreio && (
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-3 text-indigo-500">
                <Truck size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Código de Envio</h4>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                Seu projeto foi postado! Acompanhe a entrega com o código de rastreamento abaixo:
              </p>
              <div className="flex items-center gap-3">
                <code className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold tracking-widest border border-indigo-500/20">
                  {pedido.codigoRastreio}
                </code>
                <a
                  href={`https://linkrastreio.com.br/?codigo=${pedido.codigoRastreio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Link2 size={12} /> Rastrear Objeto
                </a>
              </div>
            </div>
          )}

          {/* Mensagem Pública do Operador */}
          {pedido.observacoesPublicas && (
            <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-borda-sutil/60 space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 block">Notas do Maker / Estúdio</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                "{pedido.observacoesPublicas}"
              </p>
            </div>
          )}
        </div>

        {/* Footer do Portal */}
        <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center justify-center gap-1.5">
          <Activity size={10} />
          <span>Monitoramento em tempo real fornecido pelo Printlog.</span>
        </div>
      </div>
    </div>
  );
}
