import { useState, useEffect } from "react";
import { Save, Droplets, ArrowRight, Tag } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";

const MOTIVOS_ABATIMENTO = [
  { valor: "Falha de Impressão", rotulo: "Falha de Impressão" },
  { valor: "Restos", rotulo: "Restos (Suportes/Brim/Raft)" },
  { valor: "Calibração", rotulo: "Calibração e Testes" },
  { valor: "Perda/Dano", rotulo: "Perda de Material / Dano" },
  { valor: "Outros", rotulo: "Outros" },
];

interface PropriedadesModalAbatimentoPeso {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (quantidadeAbatida: number, motivo: string) => void;
  material: Material | null;
}

export function ModalAbatimentoPeso({ aberto, aoFechar, aoConfirmar, material }: PropriedadesModalAbatimentoPeso) {
  const [quantidade, definirQuantidade] = useState<string>("");
  const [motivo, definirMotivo] = useState<string>("");
  const [erro, definirErro] = useState<string | null>(null);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const temAlteracoes = quantidade !== "" || motivo !== "";

  useEffect(() => {
    if (aberto) {
      definirQuantidade("");
      definirMotivo("");
      definirErro(null);
      definirConfirmarDescarte(false);
    }
  }, [aberto]);

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

  const unidade = material.tipo === "SLA" ? "ml" : "g";
  const numQtd = Number(quantidade.replace(",", "."));

  // Simulação do resultado (Preview)
  const pesoRestanteAtual = material.pesoRestanteGramas;
  const novoPesoRestante = Math.max(0, pesoRestanteAtual - (numQtd || 0));
  const abaterDoEstoqueLacrado = numQtd > pesoRestanteAtual; // Se o cara pedir pra abater mais do que tem no rolo atual

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantidade) {
      definirErro("Digite uma quantidade para abater.");
      return;
    }

    if (isNaN(numQtd) || numQtd <= 0) {
      definirErro("Digite um valor numérico válido maior que zero.");
      return;
    }

    const estoqueTotalDisponivel = material.pesoRestanteGramas + material.estoque * material.pesoGramas;

    if (numQtd > estoqueTotalDisponivel) {
      definirErro(`Você não tem tudo isso. Máximo possível: ${estoqueTotalDisponivel}${unidade}`);
      return;
    }

    aoConfirmar(numQtd, motivo);
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Abater Consumo" larguraMax="max-w-md">
      <form onSubmit={lidarComEnvio} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6 relative z-10">
          {/* Cabeçalho do Material */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 shadow-sm dark:shadow-none dark:border-white/5 relative z-10 w-full mb-6">
            <div
              className="w-10 h-10 rounded-full border-2 shadow-inner flex-shrink-0"
              style={{
                backgroundColor: material.cor,
                borderColor: "rgba(0,0,0,0.1)",
              }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                {material.nome}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                Atual:{" "}
                <strong className="text-sky-500">
                  {material.pesoRestanteGramas}
                  {unidade}
                </strong>{" "}
                no uso (Estoque: {material.estoque}x)
              </span>
            </div>
          </div>

          {/* Input de Quantidade */}
          <div className="relative">
            <CampoTexto
              autoFocus
              rotulo="Quantidade gasta (Gramas/ML)"
              icone={Droplets}
              type="number"
              step="any"
              value={quantidade}
              onChange={(e) => {
                definirQuantidade(e.target.value);
                if (erro) definirErro(null);
              }}
              placeholder={`Ex: 50`}
              erro={erro || undefined}
            />
            <span className="absolute right-0 top-[38px] text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none uppercase tracking-widest">
              {unidade}
            </span>
          </div>

          <div className="relative z-50">
            <Combobox
              titulo="Motivo do abatimento (Opcional)"
              opcoes={MOTIVOS_ABATIMENTO}
              valor={motivo}
              aoAlterar={definirMotivo}
              placeholder="Selecione ou digite o motivo..."
              permitirNovo={true}
              icone={Tag}
            />
          </div>

          {/* Preview do Impacto */}
          {numQtd > 0 && !erro && (
            <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2">
                Simulação do Estoque
              </h4>

              <div className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-zinc-300">
                <span>Rolo/Garrafa em uso</span>
                <div className="flex items-center gap-2">
                  <span className="line-through opacity-50">
                    {pesoRestanteAtual}
                    {unidade}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className={abaterDoEstoqueLacrado ? "text-red-500" : "text-green-500 dark:text-green-400"}>
                    {abaterDoEstoqueLacrado ? "ESGOTADO" : `${novoPesoRestante}${unidade}`}
                  </span>
                </div>
              </div>

              {abaterDoEstoqueLacrado && (
                <div className="mt-2 pt-2 border-t border-sky-200/50 dark:border-sky-500/20 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                  <span>Um rolo/garrafa do estoque será aberto!</span>
                  <span>-1 Unidade Lacrada</span>
                </div>
              )}
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
                disabled={!!erro || !quantidade}
                style={{ backgroundColor: "var(--cor-primaria)" }}
                className="px-6 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save size={16} strokeWidth={3} />
                Confirmar Baixa
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
