import { useState, useEffect } from "react";
import { Download, Database, User, PackageSearch, Activity, FolderKanban, CheckCircle2 } from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { CabecalhoCard } from "./Compartilhados";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemClientes } from "@/funcionalidades/comercial/clientes/estado/armazemClientes";
import { useArmazemPedidos } from "@/funcionalidades/producao/projetos/estado/armazemPedidos";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";
import { apiClientes } from "@/funcionalidades/comercial/clientes/servicos/apiClientes";
import { servicoPedidos } from "@/funcionalidades/producao/projetos/servicos/servicoPedidos";
import { toast } from "react-hot-toast";

export function CardMetricas() {
  const { usuario } = useAutenticacao();
  const [exportando, definirExportando] = useState(false);
  const [mensagemSucesso, definirMensagemSucesso] = useState("");
  const [carregandoMetricas, definirCarregandoMetricas] = useState(true);

  // Acessando dados reais dos armazéns (Estado Global)
  const totalClientes = useArmazemClientes((estado) => estado.clientes.length);
  const totalMateriais = useArmazemMateriais((estado) => estado.materiais.length);
  const totalInsumos = useArmazemInsumos((estado) => estado.insumos.length);
  const totalMaquinas = useArmazemImpressoras((estado) => estado.impressoras.length);
  const totalProjetos = useArmazemPedidos((estado) => estado.pedidos.length);

  // Carrega e sincroniza todos os dados dos armazéns no mount
  useEffect(() => {
    if (!usuario?.uid) return;

    const carregarDados = async () => {
      definirCarregandoMetricas(true);
      try {
        const [mats, ins, imps, clis, peds] = await Promise.all([
          apiMateriais.listar(usuario.uid),
          apiInsumos.listar(usuario.uid),
          apiImpressoras.buscarTodas(usuario.uid),
          apiClientes.buscarTodos(usuario.uid),
          servicoPedidos.buscarPedidos(usuario.uid)
        ]);

        useArmazemMateriais.getState().definirMateriais(mats);
        useArmazemInsumos.getState().definirInsumos(ins);
        useArmazemImpressoras.getState().definirImpressoras(imps);
        useArmazemClientes.getState().definirClientes(clis);
        useArmazemPedidos.getState().definirPedidos(peds);
      } catch (erro) {
        registrar.error(
          { rastreioId: "sistema", servico: "CardMetricas" },
          "Erro ao carregar dados dos armazéns para o Painel",
          erro
        );
      } finally {
        definirCarregandoMetricas(false);
      }
    };

    carregarDados();
  }, [usuario?.uid]);

  const gerarLogBackend = (formato: string) => {
    // [Art. 37 - ROA] Simulando log em um sistema de auditoria (D1/Logs).
    registrar.info(
      {
        rastreioId: "auditoria-portabilidade", // No futuro viria do contexto de req
        titularId: usuario?.uid || "Desconhecido",
        formato,
      },
      `Exercício do Direito de Portabilidade (Art. 18, V)`,
    );
  };

  const exibirSucesso = () => {
    definirMensagemSucesso("Exportação concluída com sucesso!");
    setTimeout(() => definirMensagemSucesso(""), 4000);
  };

  const lidarComExportacao = (tipo: string) => {
    if (!usuario) {
      alert("Acesso Negado: Sessão expirada. Faça login novamente para exportar seus dados.");
      return;
    }

    definirExportando(true);
    gerarLogBackend(tipo);

    const dataHora = new Date().toISOString().split("T")[0];
    const nomeArquivo = `printlog_exportacao_${dataHora}`;

    try {
      if (tipo === "JSON") {
        const dados = {
          metadata: {
            titular: usuario.nome || "Usuário não identificado",
            usuario_id: usuario.uid,
            dataExportacao: new Date().toISOString(),
            versaoSistema: "BETA",
            referenciaLegal: "Direito de Portabilidade - Art. 18, V, LGPD",
            politicaPrivacidade: "https://printlog.com.br/politica-de-privacidade",
            isolamento: "Dados restritos ao UID logado (Art. 6º, I).",
          },
          dados_pessoais: {
            clientes: useArmazemClientes.getState().clientes,
            projetos: useArmazemPedidos.getState().pedidos,
            filamentos: useArmazemMateriais.getState().materiais,
            insumos: useArmazemInsumos.getState().insumos,
            maquinas: useArmazemImpressoras.getState().impressoras,
          },
        };
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${nomeArquivo}.json`;
        link.click();
        URL.revokeObjectURL(url);
        exibirSucesso();
      } else if (tipo === "PLANILHA (CSV)") {
        let csvContent = "";
        csvContent += `Titular:,${usuario.nome || "Usuário"}\n`;
        csvContent += `ID Titular:,${usuario.uid}\n`;
        csvContent += `Data de Exportacao:,${new Date().toISOString()}\n`;
        csvContent += `Versão do Sistema:,BETA\n`;
        csvContent += `Referencia Legal:,Direito de Portabilidade - Art. 18 V LGPD\n`;
        csvContent += `Politica de Privacidade:,https://printlog.com.br/politica-de-privacidade\n\n`;
        csvContent += `Tipo de Dado,Quantidade,Nota de Isolamento\n`;
        csvContent += `Filamentos,${totalMateriais},Dados confidenciais e restritos ao UID ${usuario.uid}\n`;
        csvContent += `Insumos,${totalInsumos},Dados confidenciais e restritos ao UID ${usuario.uid}\n`;
        csvContent += `Máquinas,${totalMaquinas},Dados confidenciais e restritos ao UID ${usuario.uid}\n`;
        csvContent += `Clientes,${totalClientes},Dados confidenciais e restritos ao UID ${usuario.uid}\n`;
        csvContent += `Projetos,${totalProjetos},Dados confidenciais e restritos ao UID ${usuario.uid}\n`;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${nomeArquivo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        exibirSucesso();
      } else if (tipo === "PDF") {
        alert(
          "Para salvar a portabilidade em PDF, selecione 'Salvar como PDF' na aba de destino da sua impressora na janela a seguir.",
        );
        window.print();
        exibirSucesso();
      }
    } catch (e) {
      registrar.error(
        { rastreioId: "sistema", servico: "CardMetricas" },
        "Erro na exportação de portabilidade LGPD",
        e,
      );
      toast.error("Falha ao exportar dados.");
    } finally {
      definirExportando(false);
    }
  };
  return (
    <div className="h-full rounded-2xl border border-borda-sutil bg-card p-4 md:p-5 flex flex-col gap-4 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
      <CabecalhoCard
        titulo="Painel do Estúdio"
        descricao="Resumo geral e exportação de dados"
        icone={Database}
        corIcone="text-cyan-500"
      />
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { val: totalClientes, lab: "Clientes", icone: User, cor: "text-sky-500", fundo: "bg-sky-500/10" },
          { val: totalMateriais, lab: "Filamentos", icone: Database, cor: "text-violet-500", fundo: "bg-violet-500/10" },
          { val: totalInsumos, lab: "Insumos", icone: PackageSearch, cor: "text-amber-500", fundo: "bg-amber-500/10" },
          { val: totalMaquinas, lab: "Máquinas", icone: Activity, cor: "text-emerald-500", fundo: "bg-emerald-500/10" },
          { val: totalProjetos, lab: "Projetos", icone: FolderKanban, cor: "text-rose-500", fundo: "bg-rose-500/10" },
        ].map((item) => (
          <div
            key={item.lab}
            className="rounded-xl border border-borda-sutil dark:border-white/10 py-2 bg-gray-50/70 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center"
          >
            <span className={`rounded-lg p-1.5 ${item.fundo} ${item.cor} mb-1`}>
              <item.icone size={13} />
            </span>
            {carregandoMetricas ? (
              <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md my-0.5" />
            ) : (
              <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{item.val}</p>
            )}
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] font-black text-gray-500 dark:text-zinc-500 truncate w-full px-1">
              {item.lab}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto bg-gray-50/70 dark:bg-white/[0.02] border border-borda-sutil dark:border-white/10 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
            {mensagemSucesso ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Download size={15} />}
          </span>
          <div className="truncate">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-900 dark:text-white leading-tight truncate">
              {mensagemSucesso || "Exportação de Dados"}
            </p>
            <p className="text-[9px] text-gray-500 dark:text-zinc-500 leading-tight truncate">
              Exportar todos os dados do estúdio
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {["PLANILHA (CSV)", "PDF", "JSON"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => lidarComExportacao(tipo)}
              disabled={exportando}
              className="h-8 px-3 rounded-xl bg-white dark:bg-card-fundo border border-borda-sutil dark:border-white/10 text-[10px] font-black uppercase text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm disabled:opacity-50 disabled:cursor-wait"
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
