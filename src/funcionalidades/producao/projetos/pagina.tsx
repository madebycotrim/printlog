import { FolderKanban, Plus, Archive, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { QuadroKanban } from "./componentes/QuadroKanban";
import { ModalArquivoProjetos } from "./componentes/ModalArquivoProjetos";
import { ModalProjetosAtrasados } from "./componentes/ModalProjetosAtrasados";
import { ModalConclusaoProjeto } from "./componentes/ModalConclusaoProjeto";
import { usePedidos } from "./hooks/usePedidos";
import { EstadoVazio } from "@/compartilhado/componentes";
import { ResumoProjetos } from "./componentes/ResumoProjetos";
import { BannerErro } from "@/compartilhado/componentes/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FormularioPedido } from "./componentes/FormularioPedido";
import { toast } from "react-hot-toast";
import { Pedido } from "./tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

export function PaginaProjetos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get("id");

  const [modalArquivoAberto, setModalArquivoAberto] = useState(false);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'producao' | 'orcamentos'>('producao');
  const [pedidoEdicao, setPedidoEdicao] = useState<Pedido | null>(null);
  const { pedidos, pedidosFiltrados, moverPedido, pesquisar, carregando, atualizarPedido, erro, recarregar } = usePedidos();

  const { usuario } = useAutenticacao();
  const [pedidoSendoConcluido, setPedidoSendoConcluido] = useState<Pedido | null>(null);

  useEffect(() => {
    if (idParam && pedidos.length > 0 && !pedidoEdicao) {
      const ped = pedidos.find(p => p.id === idParam);
      if (ped) {
        setPedidoEdicao(ped);
        const novosParams = new URLSearchParams(searchParams);
        novosParams.delete("id");
        setSearchParams(novosParams);
      }
    }
  }, [idParam, pedidos, pedidoEdicao, searchParams, setSearchParams]);

  const lidarComMover = async (id: string, novoStatus: StatusPedido) => {
    if (novoStatus === StatusPedido.CONCLUIDO) {
      const ped = pedidos.find(p => p.id === id);
      if (ped) {
        setPedidoSendoConcluido(ped);
        return;
      }
    }
    await moverPedido(id, novoStatus);
  };

  const confirmarConclusaoComPerda = async (gramasPerdidas: Record<string, number>) => {
    if (!pedidoSendoConcluido || !usuario?.uid) return;

    try {
      for (const [idMaterial, qtd] of Object.entries(gramasPerdidas)) {
        if (qtd > 0) {
          useArmazemMateriais.getState().abaterPeso(idMaterial, qtd, `Falha: ${pedidoSendoConcluido.descricao}`, "FALHA");
          const materialAtualizado = useArmazemMateriais.getState().materiais.find(m => m.id === idMaterial);
          if (materialAtualizado) {
            await apiMateriais.atualizar(materialAtualizado, usuario.uid);
          }
        }
      }

      if (pedidoSendoConcluido.materiais && pedidoSendoConcluido.materiais.length > 0) {
        for (const mat of pedidoSendoConcluido.materiais) {
          if (mat.quantidadeGasta > 0) {
            useArmazemMateriais.getState().abaterPeso(mat.idMaterial, mat.quantidadeGasta, `Conclusão: ${pedidoSendoConcluido.descricao}`, "SUCESSO");
            const materialAtualizado = useArmazemMateriais.getState().materiais.find(m => m.id === mat.idMaterial);
            if (materialAtualizado) {
              await apiMateriais.atualizar(materialAtualizado, usuario.uid);
            }
          }
        }
      } else if (pedidoSendoConcluido.material && pedidoSendoConcluido.pesoGramas) {
        const matAtual = useArmazemMateriais.getState().materiais.find(m =>
          m.nome.toLowerCase().includes(pedidoSendoConcluido.material!.toLowerCase()) ||
          pedidoSendoConcluido.material!.toLowerCase().includes(m.nome.toLowerCase())
        );
        if (matAtual && pedidoSendoConcluido.pesoGramas > 0) {
          useArmazemMateriais.getState().abaterPeso(matAtual.id, pedidoSendoConcluido.pesoGramas, `Conclusão: ${pedidoSendoConcluido.descricao}`, "SUCESSO");
          const materialAtualizado = useArmazemMateriais.getState().materiais.find(m => m.id === matAtual.id);
          if (materialAtualizado) {
            await apiMateriais.atualizar(materialAtualizado, usuario.uid);
          }
        }
      }
    } catch (e) {
      console.error("Erro ao registrar conclusão:", e);
    }

    await moverPedido(pedidoSendoConcluido.id, StatusPedido.CONCLUIDO);
    setPedidoSendoConcluido(null);
  };

  useDefinirCabecalho({
    titulo: "Fluxo de Produção",
    subtitulo: "Gerencie seus pedidos no Kanban",
    placeholderBusca: "BUSCAR PEDIDO...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Novo Pedido",
      icone: Plus,
      aoClicar: () => navigate("/calculadora"),
    },
  });

  const abrirFormularioEdicao = (id: string) => {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) setPedidoEdicao(pedido);
  };

  // Listas derivadas (calculadas uma vez)
  const pedidosProducao = pedidosFiltrados.filter(
    p => p.status !== StatusPedido.ORCAMENTO && p.status !== StatusPedido.ARQUIVADO
  );
  const pedidosOrcamento = pedidos.filter(p => p.status === StatusPedido.ORCAMENTO);
  const pedidosArquivados = pedidos.filter(p => p.status === StatusPedido.ARQUIVADO);
  const semTudo = pedidos.length === 0;
  const soPendentes = !semTudo && pedidosProducao.length === 0 && pedidosOrcamento.length === 0;

  if (erro) {
    return (
      <BannerErro
        titulo="Falha ao carregar projetos"
        aoTentarNovamente={() => recarregar(true)}
      />
    );
  }

  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primaria border-t-transparent animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Carregando projetos...</span>
        </div>
      </div>
    );
  }

  if (semTudo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EstadoVazio
          titulo="Nenhum pedido no fluxo"
          descricao="Crie o seu primeiro pedido para iniciar a gestão de produção no Kanban."
          icone={FolderKanban}
          textoBotao="Novo Pedido"
          aoClicarBotao={() => navigate("/calculadora")}
        />
      </div>
    );
  }

  if (soPendentes) {
    return (
      <div className="flex-1 flex flex-col space-y-8">
        <ResumoProjetos
          pedidos={pedidos}
          aoAbrirArquivo={() => setModalArquivoAberto(true)}
          aoAbrirAtrasados={() => setModalAtrasadosAberto(true)}
        />
        <div className="flex-1 flex items-center justify-center py-10">
          <EstadoVazio
            titulo="Fluxo de produção limpo"
            descricao="Você não tem pedidos ativos no momento, mas seu histórico está salvo no arquivo."
            icone={Archive}
            textoBotao="Ver Projetos Arquivados"
            aoClicarBotao={() => setModalArquivoAberto(true)}
          />
        </div>

        <ModalArquivoProjetos aberto={modalArquivoAberto} aoFechar={() => setModalArquivoAberto(false)} pedidos={pedidos} abrirFormularioEdicao={abrirFormularioEdicao} />
        <ModalProjetosAtrasados aberto={modalAtrasadosAberto} aoFechar={() => setModalAtrasadosAberto(false)} pedidos={pedidos} abrirFormularioEdicao={abrirFormularioEdicao} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
      <ResumoProjetos
        pedidos={pedidos}
        aoAbrirArquivo={() => setModalArquivoAberto(true)}
        aoAbrirAtrasados={() => setModalAtrasadosAberto(true)}
      />

      {/* Seletor de Aba */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-2xl w-full max-w-xs mx-auto shrink-0">
        <button
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${abaAtiva === 'producao' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          onClick={() => setAbaAtiva('producao')}
        >
          Produção
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${abaAtiva === 'orcamentos' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          onClick={() => setAbaAtiva('orcamentos')}
        >
          Orçamentos
          {pedidosOrcamento.length > 0 && (
            <span className="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {pedidosOrcamento.length}
            </span>
          )}
        </button>
      </div>

      {/* Aba Produção */}
      {abaAtiva === 'producao' && (
        <div className="flex-1 min-h-0 flex flex-col space-y-6 overflow-hidden">
          <div className="flex-1 min-h-0">
            <QuadroKanban
              pedidosInjetados={pedidosProducao}
              abrirFormularioEdicao={abrirFormularioEdicao}
              aoMover={lidarComMover}
            />
          </div>
          {pedidosArquivados.length > 0 && (
            <div className="mx-auto shrink-0 pb-2">
              <button
                onClick={() => setModalArquivoAberto(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all group"
              >
                <Archive size={14} className="text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {pedidosArquivados.length} projetos no arquivo
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Aba Orçamentos */}
      {abaAtiva === 'orcamentos' && (
        <div className="flex-1 overflow-auto flex flex-col gap-3 px-1 pb-4">
          {pedidosOrcamento.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-16 font-medium">
              Nenhum orçamento pendente. 📭
            </p>
          ) : (
            pedidosOrcamento.map(p => (
              <div key={p.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-borda-sutil flex items-center justify-between shadow-sm gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{p.descricao || "Sem nome"}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {centavosParaReais(p.valorCentavos)}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(p.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/o/${p.id}`); toast.success("Link Mágico copiado!"); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 transition-colors border border-violet-100 dark:border-violet-900/30"
                  >
                    Copiar Link
                  </button>
                  <button
                    onClick={() => navigate(`/calculadora?id=${p.id}`)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 transition-colors border border-sky-100 dark:border-sky-900/30"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => lidarComMover(p.id, StatusPedido.A_FAZER)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-1"
                  >
                    <CheckCircle size={12} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => lidarComMover(p.id, StatusPedido.ARQUIVADO)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 transition-colors border border-rose-100 dark:border-rose-900/30"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ModalArquivoProjetos aberto={modalArquivoAberto} aoFechar={() => setModalArquivoAberto(false)} pedidos={pedidos} abrirFormularioEdicao={abrirFormularioEdicao} />
      <ModalProjetosAtrasados aberto={modalAtrasadosAberto} aoFechar={() => setModalAtrasadosAberto(false)} pedidos={pedidos} abrirFormularioEdicao={abrirFormularioEdicao} />
      <ModalConclusaoProjeto aberto={!!pedidoSendoConcluido} aoFechar={() => setPedidoSendoConcluido(null)} pedido={pedidoSendoConcluido} aoConfirmar={confirmarConclusaoComPerda} />
      <FormularioPedido
        aberto={!!pedidoEdicao}
        pedidoEdicao={pedidoEdicao}
        aoCancelar={() => setPedidoEdicao(null)}
        aoSalvar={async (dados) => {
          if (pedidoEdicao) {
            await atualizarPedido({ ...dados, id: pedidoEdicao.id });
            setPedidoEdicao(null);
          }
        }}
      />
    </div>
  );
}
