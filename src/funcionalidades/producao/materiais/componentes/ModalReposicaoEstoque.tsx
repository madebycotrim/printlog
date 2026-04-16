import { useState, useEffect } from "react";
import { PackagePlus, Save, ShoppingCart, Package } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";

interface PropriedadesModalReposicaoEstoque {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (quantidadeNovos: number, precoTotalNovaCompra: number) => void;
  material: Material | null;
}

export function ModalReposicaoEstoque({ aberto, aoFechar, aoConfirmar, material }: PropriedadesModalReposicaoEstoque) {
  const [quantidade, definirQuantidade] = useState<string>("1");
  const [precoUnidade, definirPrecoUnidade] = useState<string>("");
  const [erro, definirErro] = useState<string | null>(null);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const temAlteracoes =
    quantidade !== "1" || precoUnidade !== (material?.precoCentavos ? (material.precoCentavos / 100).toString() : "");

  useEffect(() => {
    if (aberto && material) {
      definirQuantidade("1");
      // Pre-preenche com o preço atual unitário (centavos -> reais)
      definirPrecoUnidade((material.precoCentavos / 100).toString());
      definirErro(null);
      definirConfirmarDescarte(false);
    }
  }, [aberto, material]);

  const fecharModalRealmente = () => {
    definirConfirmarDescarte(false);
    aoFechar();
  };

  const lidarComTentativaFechamento = () => {
    if (temAlteracoes && !confirmarDescarte) {
      definirConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  if (!material) return null;

  const numQtd = parseInt(quantidade);
  const numPreco = Number(precoUnidade.replace(",", "."));
  const precoTotalNovo = numQtd * numPreco;

  // Simulando Preço Médio
  const unidadeStr = material.tipo === "SLA" ? "ml" : "g";
  const estoqueEmUsoFracao = material.pesoRestanteGramas / material.pesoGramas;
  const estoqueTotalAtualFract = material.estoque + estoqueEmUsoFracao;
  const valorTotalAtual = estoqueTotalAtualFract * material.precoCentavos;

  const novoEstoqueTotalFract = estoqueTotalAtualFract + (numQtd || 0);
  const novoValorTotal = valorTotalAtual + (Math.round(precoTotalNovo * 100) || 0);
  const novoPrecoMedioUnitario = novoValorTotal / (novoEstoqueTotalFract || 1);

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(numQtd) || numQtd <= 0) {
      definirErro("Digite uma quantidade válida (min 1).");
      return;
    }

    if (isNaN(numPreco) || numPreco < 0) {
      definirErro("Digite um valor numérico válido para o preço.");
      return;
    }

    aoConfirmar(numQtd, Math.round(precoTotalNovo * 100));
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo="Repor Estoque Rápidamente"
      larguraMax="max-w-md"
    >
      <form onSubmit={lidarComEnvio} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18181b] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
              <PackagePlus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100">{material.nome}</h4>
              <p className="text-xs font-semibold text-indigo-600/80 dark:text-indigo-400/80">
                Estoque atual: {material.estoque} lacrados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <CampoTexto
              autoFocus
              rotulo="Qtde Adquirida"
              icone={Package}
              type="number"
              min="1"
              step="1"
              value={quantidade}
              onChange={(e) => {
                definirQuantidade(e.target.value);
                if (erro) definirErro(null);
              }}
              erro={erro && !precoUnidade ? erro : undefined}
            />

            <CampoMonetario
              rotulo="Preço Unitário"
              icone={ShoppingCart}
              placeholder="0,00"
              value={precoUnidade}
              onChange={(e: any) => {
                definirPrecoUnidade(e.target.value);
                if (erro) definirErro(null);
              }}
              erro={erro && precoUnidade ? erro : undefined}
            />
          </div>

          {/* Simulador de Preço Médio */}
          {numQtd > 0 && numPreco >= 0 && !erro && (
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 mt-4 space-y-3">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-500 dark:text-zinc-500">
                Recálculo de Custos
              </h5>

              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-600 dark:text-zinc-400">
                  Preço Atual / {material.pesoGramas}
                  {unidadeStr}
                </span>
                <span className="text-gray-900 dark:text-white">R$ {(material.precoCentavos / 100).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-600 dark:text-zinc-400">Novo Preço Médio (Custo Real)</span>
                <span
                  className={`${novoPrecoMedioUnitario / 100 > material.precoCentavos / 100 ? "text-rose-500" : novoPrecoMedioUnitario / 100 < material.precoCentavos / 100 ? "text-emerald-500" : "text-gray-900 dark:text-white"} font-black`}
                >
                  R$ {(novoPrecoMedioUnitario / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ PADRONIZADO v9.0 */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!!erro || !quantidade || !precoUnidade}
                style={{ backgroundColor: "var(--cor-primaria)" }}
                className="px-6 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save size={16} strokeWidth={3} />
                Confirmar Reposição
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                <button
                  type="button"
                  onClick={fecharModalRealmente}
                  className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  Descartar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => definirConfirmarDescarte(false)}
                  className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Continuar Editando
                </button>
              </div>
              {temAlteracoes && (
                <span className="text-[9px] font-black text-red-600/70 dark:text-red-500/50 uppercase tracking-[0.2em] mr-2">
                  Há alterações não salvas que serão perdidas
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </Dialogo>
  );
}
