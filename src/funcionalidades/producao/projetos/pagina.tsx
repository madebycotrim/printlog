import { FolderKanban, Plus, Archive } from "lucide-react";
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
import { Pedido } from "./tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { apiFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/apiFinanceiro";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { toast } from "sonner";

export function PaginaProjetos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get("id");

  const [modalArquivoAberto, setModalArquivoAberto] = useState(false);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);

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

  const confirmarConclusaoComPerda = async (gramasPerdidas: Record<string, number>, gerarReceitaFinanceira: boolean) => {
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

      if (pedidoSendoConcluido.insumosSecundarios && pedidoSendoConcluido.insumosSecundarios.length > 0) {
        for (const insumo of pedidoSendoConcluido.insumosSecundarios) {
          if (insumo.quantidade > 0) {
            useArmazemInsumos.getState().abaterQuantidade(insumo.idInsumo, insumo.quantidade, `Projeto Concluído: ${pedidoSendoConcluido.descricao}`);
            const insumoAtualizado = useArmazemInsumos.getState().insumos.find((i: any) => i.id === insumo.idInsumo);
            if (insumoAtualizado) {
              await apiInsumos.atualizar(insumoAtualizado, usuario.uid);
            }
          }
        }
      }
      
      if (gerarReceitaFinanceira) {
         try {
           await apiFinanceiro.registrar({
              tipo: TipoLancamentoFinanceiro.ENTRADA,
              valorCentavos: pedidoSendoConcluido.valorCentavos,
              descricao: `Receita Projeto: ${pedidoSendoConcluido.descricao}`,
              categoria: "Venda de Serviços",
              idPedido: pedidoSendoConcluido.id,
              idCliente: pedidoSendoConcluido.idCliente !== "avulso" ? pedidoSendoConcluido.idCliente : undefined,
              status: "pago"
           }, usuario.uid);
           toast.success("Receita registrada no Financeiro!");
         } catch(e) {
           console.error("Erro ao gerar receita:", e);
           toast.error("Erro ao registrar no financeiro.");
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
    p => p.status !== StatusPedido.ARQUIVADO
  );
  const pedidosArquivados = pedidos.filter(p => p.status === StatusPedido.ARQUIVADO);
  const semTudo = pedidos.length === 0;
  const soPendentes = !semTudo && pedidosProducao.length === 0;

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
          titulo="Nenhum projeto salvo"
          descricao="Aqui ficam seus orçamentos salvos. Vamos criar o primeiro?"
          icone={FolderKanban}
          textoBotao="Novo Projeto"
          aoClicarBotao={() => navigate("/calculadora")}
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-4">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <strong className="font-black uppercase tracking-wider text-[10px]">💡 Como Funciona:</strong> Use a calculadora para gerar um orçamento. Quando terminar, clique em <strong>Salvar Orçamento</strong> para que ele apareça aqui e você possa acompanhar a produção!
            </p>
          </div>
        </EstadoVazio>
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
    <div className="flex-1 flex flex-col space-y-8 overflow-hidden min-h-0">
      <ResumoProjetos
        pedidos={pedidos}
        aoAbrirArquivo={() => setModalArquivoAberto(true)}
        aoAbrirAtrasados={() => setModalAtrasadosAberto(true)}
      />

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
