import { useState, useEffect } from "react";
import { Save, Trash2, ArrowRight, Tag, AlertCircle } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";

const MOTIVOS_FALHA = [
  { valor: "Queda de Energia", rotulo: "Queda de Energia" },
  { valor: "Entupimento (Clog)", rotulo: "Entupimento de Bico (Clog)" },
  { valor: "Descolamento (Warping)", rotulo: "Descolamento da Mesa (Warping)" },
  { valor: "Falta de Material", rotulo: "Fim do Carretel inesperado" },
  { valor: "Erro de Fatiamento", rotulo: "Erro de Fatiamento / Configuração" },
  { valor: "Falha de Suporte", rotulo: "Quebra de Suporte" },
  { valor: "Outros", rotulo: "Outros" },
];

interface PropriedadesModalRegistrarPerda {
  aberto: boolean;
  aoFechar: () => void;
  materiais: Material[];
  aoConfirmar: (idMaterial: string, quantidadeAbatida: number, motivo: string) => void;
}

export function ModalRegistrarPerda({ aberto, aoFechar, materiais, aoConfirmar }: PropriedadesModalRegistrarPerda) {
  const [idMaterial, definirIdMaterial] = useState<string>("");
  const [quantidade, definirQuantidade] = useState<string>("");
  const [motivo, definirMotivo] = useState<string>("");
  const [erro, definirErro] = useState<string | null>(null);

  const materialSelecionado = materiais.find((m) => m.id === idMaterial) || null;

  useEffect(() => {
    if (aberto) {
      definirIdMaterial("");
      definirQuantidade("");
      definirMotivo("");
      definirErro(null);
    }
  }, [aberto]);

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idMaterial) {
      definirErro("Selecione o material que foi perdido.");
      return;
    }

    const numQtd = Number(quantidade.replace(",", "."));
    if (!quantidade || isNaN(numQtd) || numQtd <= 0) {
      definirErro("Digite uma quantidade válida.");
      return;
    }

    if (
      materialSelecionado &&
      numQtd > materialSelecionado.pesoRestanteGramas + materialSelecionado.estoque * materialSelecionado.pesoGramas
    ) {
      definirErro("Quantidade superior ao estoque disponível.");
      return;
    }

    aoConfirmar(idMaterial, numQtd, motivo || "Falha Técnica");
    aoFechar();
  };

  const opcoesMateriais = materiais.map((m) => ({
    valor: m.id,
    rotulo: `${m.nome} (${m.cor})`,
  }));

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Registrar Perda / Sucata" larguraMax="max-w-md">
      <form onSubmit={lidarComEnvio} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6">
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Atenção</p>
              <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300 leading-relaxed">
                Este registro abaterá o estoque e será contabilizado como **prejuízo operacional** nos relatórios de
                desperdício.
              </p>
            </div>
          </div>

          <div className="relative z-[60]">
            <Combobox
              titulo="Material Perdido"
              opcoes={opcoesMateriais}
              valor={idMaterial}
              aoAlterar={definirIdMaterial}
              placeholder="Selecione o material..."
              icone={Trash2}
            />
          </div>

          <div className="relative">
            <CampoTexto
              rotulo="Quantidade Perdida (Gramas)"
              type="number"
              step="any"
              value={quantidade}
              onChange={(e) => {
                definirQuantidade(e.target.value);
                if (erro) definirErro(null);
              }}
              placeholder="Ex: 150"
              erro={idMaterial && erro ? erro : undefined}
            />
          </div>

          <div className="relative z-[50]">
            <Combobox
              titulo="Motivo da Falha"
              opcoes={MOTIVOS_FALHA}
              valor={motivo}
              aoAlterar={definirMotivo}
              placeholder="O que aconteceu?"
              permitirNovo={true}
              icone={Tag}
            />
          </div>

          {materialSelecionado && Number(quantidade) > 0 && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Impacto no Estoque</span>
                <span className="text-zinc-500">{materialSelecionado.nome}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 dark:text-zinc-400">Novo Peso Restante:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-500">
                    {Math.max(0, materialSelecionado.pesoRestanteGramas - Number(quantidade)).toFixed(1)}g
                  </span>
                  <ArrowRight size={12} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 transition-all"
          >
            <Save size={16} />
            Registrar Perda
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
