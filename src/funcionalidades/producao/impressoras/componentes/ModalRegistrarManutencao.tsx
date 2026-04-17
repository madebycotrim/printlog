import { useState, useEffect } from "react";
import { Save, Wrench, Clock, FileText, Settings, User, Activity, AlertCircle } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Impressora, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";

interface ModalRegistrarManutencaoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => void;
  impressora: Impressora | null;
}

export function ModalRegistrarManutencao({ aberto, aoFechar, aoConfirmar, impressora }: ModalRegistrarManutencaoProps) {
  const [tipo, definirTipo] = useState<"Preventiva" | "Corretiva" | "Melhoria">("Preventiva");
  const [descricao, definirDescricao] = useState("");
  const [pecasTrocadas, definirPecasTrocadas] = useState("");
  const [custo, definirCusto] = useState("");
  const [responsavel, definirResponsavel] = useState("");
  const [tempoParadaHoras, definirTempoParadaHoras] = useState("");
  const [horasMaquinaNoMomento, definirHorasMaquinaNoMomento] = useState("");

  const [erro, definirErro] = useState<string | null>(null);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const temAlteracoes =
    tipo !== "Preventiva" ||
    descricao !== "" ||
    pecasTrocadas !== "" ||
    custo !== "" ||
    responsavel !== "" ||
    tempoParadaHoras !== "" ||
    horasMaquinaNoMomento !==
      (impressora?.horimetroTotalMinutos ? (impressora.horimetroTotalMinutos / 60).toFixed(1) : "");

  useEffect(() => {
    if (aberto && impressora) {
      definirTipo("Preventiva");
      definirDescricao("");
      definirPecasTrocadas("");
      definirCusto("");
      definirResponsavel("");
      definirTempoParadaHoras("");
      definirHorasMaquinaNoMomento(
        impressora.horimetroTotalMinutos ? (impressora.horimetroTotalMinutos / 60).toFixed(1) : "",
      );
      definirErro(null);
      definirConfirmarDescarte(false);
    }
  }, [aberto, impressora]);

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

  if (!impressora) return null;

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim()) {
      definirErro("A descrição da manutenção é obrigatória.");
      return;
    }

    if (!responsavel.trim()) {
      definirErro("O responsável pela manutenção é obrigatório.");
      return;
    }

    const numCusto = Number(custo.replace(",", "."));
    if (custo && isNaN(numCusto)) {
      definirErro("O custo deve ser um valor numérico válido.");
      return;
    }

    const registro: Omit<RegistroManutencao, "id" | "data"> = {
      tipo,
      descricao,
      responsavel,
      custoCentavos: Math.round(numCusto * 100) || 0,
      pecasTrocadas: pecasTrocadas || undefined,
      tempoParadaMinutos: tempoParadaHoras ? Math.round(Number(tempoParadaHoras) * 60) : 0,
      horasMaquinaNoMomentoMinutos: horasMaquinaNoMomento ? Math.round(Number(horasMaquinaNoMomento) * 60) : 0,
    };

    aoConfirmar(impressora.id, registro);
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo="Registrar Manutenção"
      larguraMax="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[500px]">
        {/* --- COLUNA ESQUERDA: CONTEXTO --- */}
        <div className="bg-gray-50 dark:bg-[#18181b] border-r border-gray-200 dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "center center",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />

          <div className="relative z-10 w-24 h-24 rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden flex items-center justify-center p-2 group-hover:shadow-md transition-shadow duration-500">
            {impressora.imagemUrl ? (
              <img src={impressora.imagemUrl} alt={impressora.nome} className="w-full h-full object-contain" />
            ) : (
              <Wrench size={32} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700" />
            )}
          </div>

          <div className="mt-8 relative z-10 text-center">
            <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1 truncate px-4 w-full">
              {impressora.nome}
            </h5>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Horímetro Atual</span>
              <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                {impressora.horimetroTotalMinutos ? (impressora.horimetroTotalMinutos / 60).toFixed(1) : 0}h
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-200/30 dark:from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
        <form onSubmit={lidarComEnvio} className="flex flex-col h-full bg-white dark:bg-[#18181b]">
          <div className="flex-1 p-6 md:p-10 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700/50">
            {/* CATEGORIA DO SERVIÇO */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                Categoria do Serviço
              </h4>
              <div className="flex bg-gray-50 dark:bg-[#0e0e11] p-1.5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm w-full">
                {["Preventiva", "Corretiva", "Melhoria"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => definirTipo(t as any)}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                      tipo === t
                        ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10"
                        : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                    }`}
                  >
                    {t === "Preventiva" && <Activity size={14} />}
                    {t === "Corretiva" && <Wrench size={14} />}
                    {t === "Melhoria" && <Settings size={14} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* DETALHES TÉCNICOS */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                Detalhes do Registro
              </h4>
              <CampoAreaTexto
                rotulo="Descrição do Serviço"
                icone={FileText}
                value={descricao}
                onChange={(e) => {
                  definirDescricao(e.target.value);
                  if (erro?.includes("descrição")) definirErro(null);
                }}
                placeholder="O que foi realizado? Limpeza de bico, tensionamento de correias..."
                erro={erro?.includes("descrição") ? erro : undefined}
                className="min-h-[100px]"
              />

              <CampoTexto
                rotulo="Componentes Afetados / Substituídos"
                icone={Settings}
                value={pecasTrocadas}
                onChange={(e) => definirPecasTrocadas(e.target.value)}
                placeholder="Peças novas ou recuperadas"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoTexto
                  rotulo="Responsável Técnico"
                  icone={User}
                  value={responsavel}
                  onChange={(e) => {
                    definirResponsavel(e.target.value);
                    if (erro?.includes("responsável")) definirErro(null);
                  }}
                  placeholder="Quem executou?"
                  erro={erro?.includes("responsável") ? erro : undefined}
                />
                <CampoMonetario
                  rotulo="Custo do Serviço (Opcional)"
                  value={custo}
                  onChange={(e: any) => {
                    definirCusto(e.target.value);
                    if (erro?.includes("custo")) definirErro(null);
                  }}
                  placeholder="0,00"
                  erro={erro?.includes("custo") ? erro : undefined}
                />
              </div>
            </div>

            {/* MÉTRICAS DE OPERAÇÃO */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                Métricas de Operação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <CampoTexto
                    rotulo="Horímetro no Momento (h)"
                    icone={Activity}
                    type="number"
                    step="0.1"
                    value={horasMaquinaNoMomento}
                    onChange={(e) => definirHorasMaquinaNoMomento(e.target.value)}
                    placeholder="Horas na máquina..."
                  />
                  <span className="absolute right-4 top-[42px] text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-widest uppercase">
                    h
                  </span>
                </div>
                <div className="relative">
                  <CampoTexto
                    rotulo="Tempo Offline (h)"
                    icone={Clock}
                    type="number"
                    step="0.1"
                    value={tempoParadaHoras}
                    onChange={(e) => definirTempoParadaHoras(e.target.value)}
                    placeholder="Duração da parada"
                  />
                  <span className="absolute right-4 top-[42px] text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-widest uppercase">
                    horas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RODAPÉ */}
          {/* RODAPÉ PADRONIZADO v9.0 */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-xl min-h-[100px] justify-center">
            {!confirmarDescarte ? (
              <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                <div className="hidden md:block flex-1">
                  {erro && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 animate-in fade-in slide-in-from-left-2">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{erro}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={lidarComTentativaFechamento}
                  className="px-6 py-2.5 flex-1 md:flex-none text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "var(--cor-primaria)" }}
                  className="px-8 py-3 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save size={16} strokeWidth={3} />
                  Confirmar Registro
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
      </div>
    </Dialogo>
  );
}
