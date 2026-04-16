/**
 * @file servicoExportacao.ts
 * @description Utilitário para exportação de dados do sistema (CSV, Texto, JSON).
 * Conformidade com LGPD (Portabilidade) e utilidade operacional.
 */

import { registrar } from "@/compartilhado/utilitarios/registrador";

export const servicoExportacao = {
  /**
   * Exporta dados para formato CSV e dispara o download.
   */
  exportarCSV: (dados: any[], colunas: { chave: string; rotulo: string }[], nomeArquivo: string) => {
    const rastreioId = crypto.randomUUID();
    try {
      const cabecalho = colunas.map((c) => c.rotulo).join(";");
      const linhas = dados.map((item) =>
        colunas
          .map((c) => {
            const valor = item[c.chave];
            return typeof valor === "string" ? `"${valor}"` : valor;
          })
          .join(";"),
      );

      const conteudo = [cabecalho, ...linhas].join("\n");
      const blob = new Blob(["\ufeff" + conteudo], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${nomeArquivo}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      registrar.info({ rastreioId, servico: "Exportação" }, `Exportação CSV concluída: ${nomeArquivo}`);
    } catch (erro) {
      registrar.error({ rastreioId, servico: "Exportação" }, "Erro ao gerar CSV", erro);
    }
  },

  /**
   * Exporta dados para JSON (Portabilidade LGPD).
   */
  exportarJSON: (dados: any, nomeArquivo: string) => {
    const rastreioId = crypto.randomUUID();
    try {
      const conteudo = JSON.stringify(dados, null, 2);
      const blob = new Blob([conteudo], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${nomeArquivo}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      registrar.info({ rastreioId, servico: "Portabilidade" }, `Exportação JSON concluída: ${nomeArquivo}`);
    } catch (erro) {
      registrar.error({ rastreioId, servico: "Portabilidade" }, "Erro ao gerar JSON", erro);
    }
  },

  /**
   * Dispara o fluxo de portabilidade LGPD consolidando dados do titular.
   * @param titular Dados do usuário logado
   * @param pedidos Pedidos vinculados (se aplicável para histórico)
   */
  gerarRelatorioPortabilidade: (titular: any, pedidos: any[]) => {
    const dataExportacao = new Date().toISOString();

    const relatorio = {
      cabecalho: {
        versao: "1.0",
        dataGeracao: dataExportacao,
        controlador: "PrintLog Studio 3D",
        baseLegal: "Portabilidade - Art. 18, V da LGPD",
      },
      titular: {
        nome: titular.nome,
        email: titular.email,
        id: titular.id,
        contato: titular.contato || "Não informado",
        dataAdesao: titular.dataCriacao || dataExportacao,
      },
      dadosAtividades: {
        contagemPedidosTotal: pedidos.length,
        historicoSimplificado: pedidos.map((p) => ({
          id: p.id,
          dataCriacao: p.dataCriacao,
          descricao: p.descricao,
          status: p.status,
          valorTotal: p.valorCentavos / 100,
        })),
      },
      avisoPrivacidade:
        "Este documento contém dados pessoais protegidos pela Lei 13.709/2018. O tratamento destes dados após o download é de responsabilidade exclusiva do titular.",
    };

    servicoExportacao.exportarJSON(
      relatorio,
      `portabilidade_printlog_${titular.nome.toLowerCase().replace(/\s/g, "_")}`,
    );
  },

  /**
   * Copia um texto formatado para a área de transferência (ex: para WhatsApp).
   */
  copiarParaAreaTransferencia: async (texto: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (erro) {
      return false;
    }
  },
};
