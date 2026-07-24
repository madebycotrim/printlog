import { LancamentoFinanceiro } from "../tipos";
import { format, parseISO } from "date-fns";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";

/**
 * Utilitário para exportar lançamentos financeiros em formato CSV compatível com Excel / Google Sheets.
 */
export function exportarLancamentosCSV(lancamentos: LancamentoFinanceiro[]) {
  if (!lancamentos || lancamentos.length === 0) return;

  const cabecalhos = ["Data", "Tipo", "Categoria", "Descricao", "Valor (R$)"];

  const linhas = lancamentos.map(l => {
    const dataObj = typeof l.dataCriacao === 'string' ? parseISO(l.dataCriacao) : new Date(l.dataCriacao);
    const dataFormatada = format(dataObj, "dd/MM/yyyy HH:mm");
    const tipo = l.tipo === TipoLancamentoFinanceiro.ENTRADA ? "Receita" : "Despesa";
    const categoria = (l.categoria || "Geral").replace(/"/g, '""');
    const descricao = (l.descricao || "").replace(/"/g, '""');
    const valorReais = (l.valorCentavos / 100).toFixed(2).replace('.', ',');

    return `"${dataFormatada}","${tipo}","${categoria}","${descricao}","${valorReais}"`;
  });

  const conteudoCSV = "\uFEFF" + [cabecalhos.join(","), ...linhas].join("\n");
  const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `fluxo_caixa_printlog_${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
