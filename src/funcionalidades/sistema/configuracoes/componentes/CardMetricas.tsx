import { useState, useEffect } from "react";
import { Download, Database, User, PackageSearch, Activity, FolderKanban, CheckCircle2, Loader2 } from "lucide-react";
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
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import jsPDF from "jspdf";
import { toast } from "sonner";

export function CardMetricas() {
  const { usuario } = useAutenticacao();
  const [exportando, definirExportando] = useState(false);
  const [tipoExportando, setTipoExportando] = useState<string | null>(null);
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
    registrar.info(
      {
        rastreioId: "auditoria-portabilidade",
        titularId: usuario?.uid || "Desconhecido",
        formato,
      },
      `Exercício do Direito de Portabilidade (Art. 18, V - LGPD)`,
    );
  };

  const exibirSucesso = (tipo: string) => {
    definirMensagemSucesso(`Arquivo ${tipo} baixado com sucesso!`);
    toast.success(`Exportação em ${tipo} concluída com sucesso!`);
    setTimeout(() => definirMensagemSucesso(""), 4000);
  };

  // Gerador de Planilha CSV completa e com encoding UTF-8 BOM
  const gerarCsvCompleto = (nomeArquivo: string) => {
    const clientes = useArmazemClientes.getState().clientes;
    const materiais = useArmazemMateriais.getState().materiais;
    const insumos = useArmazemInsumos.getState().insumos;
    const impressoras = useArmazemImpressoras.getState().impressoras;
    const pedidos = useArmazemPedidos.getState().pedidos;

    let csv = "\ufeff"; // UTF-8 BOM para compatibilidade 100% com Excel

    // 1. Resumo do Estúdio
    csv += "PRINTLOG - RELATÓRIO E EXPORTAÇÃO COMPLETA DO ESTÚDIO\n";
    csv += `Titular;${usuario?.nome || "Maker"}\n`;
    csv += `E-mail;${usuario?.email || ""}\n`;
    csv += `Data da Exportação;${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}\n`;
    csv += `Base Legal;Direito de Portabilidade - Art. 18 V da Lei 13.709/2018 (LGPD)\n\n`;

    csv += "RESUMO GERAL\n";
    csv += "Entidade;Quantidade Cadastrada\n";
    csv += `Clientes;${clientes.length}\n`;
    csv += `Filamentos / Materiais;${materiais.length}\n`;
    csv += `Insumos de Produção;${insumos.length}\n`;
    csv += `Máquinas / Impressoras 3D;${impressoras.length}\n`;
    csv += `Projetos / Pedidos;${pedidos.length}\n\n`;

    // 2. Clientes
    csv += "--- CLIENTES CADASTRADOS ---\n";
    csv += "Nome;E-mail;Telefone;Tipo;Status;Faturamento LTV;Projetos Produzidos;Canal de Origem;Observações CRM\n";
    clientes.forEach((c) => {
      const nome = `"${(c.nome || "").replace(/"/g, '""')}"`;
      const email = `"${(c.email || "").replace(/"/g, '""')}"`;
      const tel = `"${(c.telefone || "").replace(/"/g, '""')}"`;
      const tipo = c.tipo || "B2C";
      const status = c.historico && c.historico.length > 0 ? "Ativo" : "Lead";
      const ltv = centavosParaReais(c.ltvCentavos);
      const projs = c.totalProdutos || 0;
      const canal = `"${(c.canalReferencia || "").replace(/"/g, '""')}"`;
      const obs = `"${(c.observacoesCRM || "").replace(/"/g, '""')}"`;
      csv += `${nome};${email};${tel};${tipo};${status};${ltv};${projs};${canal};${obs}\n`;
    });
    csv += "\n";

    // 3. Filamentos
    csv += "--- ESTOQUE DE FILAMENTOS E MATERIAIS ---\n";
    csv += "Nome;Marca;Tipo de Material;Cor;Preço por Kg;Estoque Restante (g)\n";
    materiais.forEach((m: any) => {
      const nome = `"${(m.nome || m.descricao || "").replace(/"/g, '""')}"`;
      const marca = `"${(m.marca || "").replace(/"/g, '""')}"`;
      const tipo = m.tipo || m.material || "PLA";
      const cor = `"${(m.cor || "").replace(/"/g, '""')}"`;
      const preco = m.precoKgCentavos ? centavosParaReais(m.precoKgCentavos) : (m.precoPorQuilo ? `R$ ${m.precoPorQuilo.toFixed(2)}` : "R$ 0,00");
      const estoque = m.estoqueGramas || m.pesoRestanteGramas || 0;
      csv += `${nome};${marca};${tipo};${cor};${preco};${estoque}\n`;
    });
    csv += "\n";

    // 4. Insumos
    csv += "--- INSUMOS DE PRODUÇÃO ---\n";
    csv += "Nome;Categoria;Custo Unitário;Unidade de Medida;Quantidade em Estoque\n";
    insumos.forEach((i: any) => {
      const nome = `"${(i.nome || i.descricao || "").replace(/"/g, '""')}"`;
      const cat = `"${(i.categoria || "").replace(/"/g, '""')}"`;
      const preco = i.custoCentavos ? centavosParaReais(i.custoCentavos) : (i.custoUnitario ? `R$ ${i.custoUnitario.toFixed(2)}` : "R$ 0,00");
      const unid = i.unidadeMedida || "un";
      const qtd = i.quantidade || 0;
      csv += `${nome};${cat};${preco};${unid};${qtd}\n`;
    });
    csv += "\n";

    // 5. Máquinas
    csv += "--- MÁQUINAS E IMPRESSORAS 3D ---\n";
    csv += "Nome;Modelo;Marca;Potência (Watts);Diâmetro do Bico (mm);Status\n";
    impressoras.forEach((imp: any) => {
      const nome = `"${(imp.nome || "").replace(/"/g, '""')}"`;
      const modelo = `"${(imp.modelo || "").replace(/"/g, '""')}"`;
      const marca = `"${(imp.marca || "").replace(/"/g, '""')}"`;
      const pot = imp.potenciaWatts || 200;
      const bico = imp.diametroBicoMm || 0.4;
      const status = imp.status || "Ativa";
      csv += `${nome};${modelo};${marca};${pot};${bico};${status}\n`;
    });
    csv += "\n";

    // 6. Pedidos
    csv += "--- PROJETOS E PEDIDOS ---\n";
    csv += "ID Pedido;Data;Status;Valor Total\n";
    pedidos.forEach((p: any) => {
      const id = p.id || "";
      const data = p.dataCriacao ? new Date(p.dataCriacao).toLocaleDateString("pt-BR") : "";
      const status = p.status || "Concluído";
      const valor = p.valorCentavos ? centavosParaReais(p.valorCentavos) : (p.valorTotal ? `R$ ${p.valorTotal.toFixed(2)}` : "R$ 0,00");
      csv += `${id};${data};${status};${valor}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nomeArquivo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Gerador de Documento PDF Corporativo real com jsPDF
  const gerarPdfCompleto = (nomeArquivo: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const clientes = useArmazemClientes.getState().clientes;
    const materiais = useArmazemMateriais.getState().materiais;
    const insumos = useArmazemInsumos.getState().insumos;
    const impressoras = useArmazemImpressoras.getState().impressoras;
    const pedidos = useArmazemPedidos.getState().pedidos;

    let y = 15;

    const verificarQuebraPagina = (espacoNecessario: number) => {
      if (y + espacoNecessario > 275) {
        doc.addPage();
        y = 18;
      }
    };

    // 1. Faixa Superior de Cabeçalho
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("PRINTLOG 3D  |  RELATÓRIO DO ESTÚDIO", 14, 11);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 18);
    doc.text(`Titular: ${usuario?.nome || "Maker"} (${usuario?.email || ""})`, 115, 18);

    y = 32;

    // 2. Quadro de Métricas Gerais
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("RESUMO OPERACIONAL", 14, y);
    y += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

    const colWidth = 182 / 5;
    const resumo = [
      { label: "Clientes", val: clientes.length },
      { label: "Filamentos", val: materiais.length },
      { label: "Insumos", val: insumos.length },
      { label: "Máquinas", val: impressoras.length },
      { label: "Projetos", val: pedidos.length },
    ];

    resumo.forEach((item, idx) => {
      const x = 14 + idx * colWidth;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.val), x + colWidth / 2, y + 6.5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, x + colWidth / 2, y + 12, { align: "center" });
    });

    y += 24;

    // 3. Seção Clientes
    verificarQuebraPagina(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`CLIENTES CADASTRADOS (${clientes.length})`, 14, y);
    y += 5;

    if (clientes.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhum cliente cadastrado no momento.", 14, y);
      y += 8;
    } else {
      clientes.slice(0, 30).forEach((c) => {
        verificarQuebraPagina(7);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${c.nome}`, 14, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const detalhes = `${c.telefone || "Sem tel"} | ${c.email || "Sem email"} | LTV: ${centavosParaReais(c.ltvCentavos)} | ${c.totalProdutos || 0} Proj.`;
        doc.text(detalhes, 72, y);
        y += 5.5;
      });
      if (clientes.length > 30) {
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`... e mais ${clientes.length - 30} clientes exportados no arquivo CSV/JSON.`, 14, y);
        y += 6;
      }
    }

    y += 4;

    // 4. Seção Filamentos
    verificarQuebraPagina(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`ESTOQUE DE FILAMENTOS (${materiais.length})`, 14, y);
    y += 5;

    if (materiais.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhum filamento cadastrado no momento.", 14, y);
      y += 8;
    } else {
      materiais.slice(0, 30).forEach((m: any) => {
        verificarQuebraPagina(7);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${m.nome || m.descricao || "Filamento"}`, 14, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const precoStr = m.precoKgCentavos ? centavosParaReais(m.precoKgCentavos) + "/kg" : (m.precoPorQuilo ? `R$ ${m.precoPorQuilo.toFixed(2)}/kg` : "Preço n/d");
        const estoqueStr = `${m.estoqueGramas || m.pesoRestanteGramas || 0}g`;
        const tipoStr = m.tipo || m.material || "PLA";
        const marcaStr = m.marca || "Genérico";
        doc.text(`${marcaStr} (${tipoStr}) | Preço: ${precoStr} | Estoque: ${estoqueStr}`, 72, y);
        y += 5.5;
      });
      if (materiais.length > 30) {
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`... e mais ${materiais.length - 30} filamentos exportados no arquivo CSV/JSON.`, 14, y);
        y += 6;
      }
    }

    y += 4;

    // 5. Seção Insumos
    verificarQuebraPagina(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`INSUMOS DE PRODUÇÃO (${insumos.length})`, 14, y);
    y += 5;

    if (insumos.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhum insumo cadastrado no momento.", 14, y);
      y += 8;
    } else {
      insumos.slice(0, 30).forEach((i: any) => {
        verificarQuebraPagina(7);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${i.nome || i.descricao || "Insumo"}`, 14, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const qtdStr = `${i.quantidade || 0} ${i.unidadeMedida || "un"}`;
        const precoStr = i.custoCentavos ? centavosParaReais(i.custoCentavos) : (i.custoUnitario ? `R$ ${i.custoUnitario.toFixed(2)}` : "R$ 0,00");
        doc.text(`${i.categoria || "Geral"} | Custo: ${precoStr} | Quantidade: ${qtdStr}`, 72, y);
        y += 5.5;
      });
    }

    y += 4;

    // 6. Seção Máquinas
    verificarQuebraPagina(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`MÁQUINAS & IMPRESSORAS 3D (${impressoras.length})`, 14, y);
    y += 5;

    if (impressoras.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhuma máquina cadastrada no momento.", 14, y);
      y += 8;
    } else {
      impressoras.slice(0, 20).forEach((imp: any) => {
        verificarQuebraPagina(7);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${imp.nome || "Impressora"}`, 14, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const statusStr = imp.status || "Ativa";
        const potenciaStr = imp.potenciaWatts ? `${imp.potenciaWatts}W` : "200W";
        const bicoStr = imp.diametroBicoMm ? `Bico ${imp.diametroBicoMm}mm` : "";
        doc.text(`${imp.modelo || imp.marca || "3D"} | Status: ${statusStr} | ${potenciaStr} ${bicoStr}`, 72, y);
        y += 5.5;
      });
    }

    // Rodapé de Conformidade LGPD em todas as páginas
    const totalPaginas = doc.getNumberOfPages();
    for (let p = 1; p <= totalPaginas; p++) {
      doc.setPage(p);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 284, 196, 284);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("PrintLog 3D Studio · Em conformidade com o Art. 18, V da Lei 13.709/2018 (LGPD)", 14, 289);
      doc.text(`Página ${p} de ${totalPaginas}`, 196, 289, { align: "right" });
    }

    doc.save(`${nomeArquivo}.pdf`);
  };

  const lidarComExportacao = async (tipo: string) => {
    if (!usuario) {
      toast.error("Acesso Negado: Faça login novamente para exportar seus dados.");
      return;
    }

    definirExportando(true);
    setTipoExportando(tipo);
    gerarLogBackend(tipo);

    const dataHora = new Date().toISOString().split("T")[0];
    const nomeArquivo = `printlog_exportacao_${dataHora}`;

    try {
      if (tipo === "JSON") {
        const dados = {
          metadata: {
            titular: usuario.nome || "Maker",
            usuario_id: usuario.uid,
            dataExportacao: new Date().toISOString(),
            versaoSistema: "1.0",
            referenciaLegal: "Direito de Portabilidade - Art. 18, V, LGPD",
            politicaPrivacidade: "https://printlog.com.br/politica-de-privacidade",
            isolamento: "Dados restritos ao estúdio do titular autenticado.",
          },
          estatisticas: {
            totalClientes,
            totalMateriais,
            totalInsumos,
            totalMaquinas,
            totalProjetos,
          },
          dados_estudio: {
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
        exibirSucesso("JSON");
      } else if (tipo === "PLANILHA (CSV)") {
        gerarCsvCompleto(nomeArquivo);
        exibirSucesso("Planilha (CSV)");
      } else if (tipo === "PDF") {
        gerarPdfCompleto(nomeArquivo);
        exibirSucesso("PDF");
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
      setTipoExportando(null);
    }
  };

  return (
    <div className="rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />
      <CabecalhoCard
        titulo="Painel do Estúdio"
        descricao="Resumo geral e exportação de dados"
        icone={Database}
        corIcone="text-cyan-500"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { val: totalClientes, lab: "Clientes", icone: User, cor: "text-sky-500", fundo: "bg-sky-500/10" },
          { val: totalMateriais, lab: "Filamentos", icone: Database, cor: "text-violet-500", fundo: "bg-violet-500/10" },
          { val: totalInsumos, lab: "Insumos", icone: PackageSearch, cor: "text-amber-500", fundo: "bg-amber-500/10" },
          { val: totalMaquinas, lab: "Máquinas", icone: Activity, cor: "text-emerald-500", fundo: "bg-emerald-500/10" },
          { val: totalProjetos, lab: "Projetos", icone: FolderKanban, cor: "text-rose-500", fundo: "bg-rose-500/10" },
        ].map((item) => (
          <div
            key={item.lab}
            className="rounded-xl border border-borda-sutil py-3 px-2 bg-muted/30 flex flex-col items-center justify-center text-center transition-all hover:bg-muted/50"
          >
            <span className={`rounded-lg p-1.5 ${item.fundo} ${item.cor} mb-1.5`}>
              <item.icone size={14} />
            </span>
            {carregandoMetricas ? (
              <div className="w-8 h-5 bg-muted animate-pulse rounded-md my-0.5" />
            ) : (
              <p className="text-base font-black text-primary leading-none">{item.val}</p>
            )}
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] font-black text-muted-foreground truncate w-full px-1">
              {item.lab}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto bg-muted/30 border border-borda-sutil p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
          <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
            {mensagemSucesso ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Download size={16} />}
          </span>
          <div className="truncate">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary leading-tight truncate">
              {mensagemSucesso || "Exportação de Dados"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
              Exportar todos os dados do estúdio
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
          {["PLANILHA (CSV)", "PDF", "JSON"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => lidarComExportacao(tipo)}
              disabled={exportando}
              className="h-9 px-3.5 rounded-xl bg-card border border-borda-sutil text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-muted/40 transition-all shadow-sm disabled:opacity-50 disabled:cursor-wait cursor-pointer flex items-center gap-1.5"
            >
              {tipoExportando === tipo && <Loader2 size={12} className="animate-spin text-cyan-500" />}
              {tipo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
