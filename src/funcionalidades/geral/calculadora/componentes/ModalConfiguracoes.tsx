import { Crown, Settings, Zap, Percent, Wrench, Clock, X } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

/**
 * Interface para as propriedades do ModalConfiguracoes.
 */
interface PropriedadesModalConfiguracoes {
  aberto: boolean;
  aoFechar: () => void;
  eProOuSuperior: boolean;
  config: any;
  hook: any;
  aoSalvar: () => Promise<void>;
}

/**
 * Modal de configurações de motores de custeio e identidade visual do estúdio.
 */
export function ModalConfiguracoes({
  aberto,
  aoFechar,
  eProOuSuperior,
  config,
  hook,
  aoSalvar
}: PropriedadesModalConfiguracoes) {
  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-4xl" esconderCabecalho={true}>
      <div className="flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden shadow-2xl relative w-full border border-borda-sutil">

        {/* PAINEL ESQUERDO: IDENTIDADE (PDF) */}
        <div className="w-full md:w-2/5 p-8 bg-zinc-50 dark:bg-zinc-900/50 relative flex flex-col border-b md:border-b-0 md:border-r border-borda-sutil">
          <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Crown size={16} className="text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-zinc-300">Personalizar Orçamento</h3>
              </div>

              <div className={`space-y-4 transition-all ${!eProOuSuperior ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Nome do Estúdio</label>
                  <input
                    type="text"
                    placeholder="Ex: PrintPro Lab"
                    value={config.nomeEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-lg px-3 text-xs font-bold text-primary dark:text-white focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Slogan / Frase de Rodapé</label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-lg px-3 text-xs font-bold text-primary dark:text-white focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview Dinâmico do Rodapé PRO */}
            {eProOuSuperior && (
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-borda-sutil flex flex-col gap-1 mt-6">
                <span className="text-[9px] font-black uppercase text-zinc-500 border-b border-borda-sutil pb-1.5 mb-1 tracking-wider">
                  Pré-Visualização
                </span>
                <span className="text-xs font-bold text-primary dark:text-zinc-200 truncate">
                  {config.nomeEstudio || "Seu Estúdio"}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 italic truncate">
                  {config.sloganEstudio || "Seu slogan aqui"}
                </span>
              </div>
            )}

            {!eProOuSuperior && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-100/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl text-center gap-2">
                <Crown size={24} className="text-zinc-400 dark:text-zinc-500" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Exclusivo PRO</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                    Personalize seus orçamentos
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-6 flex justify-between items-center text-[8px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest pt-4 border-t border-borda-sutil">
            <span>PrintLog OS</span>
            <span>2026</span>
          </div>
        </div>

        {/* PAINEL DIREITO: MOTORES OPERACIONAIS */}
        <div className="w-full md:w-3/5 p-8 bg-card relative flex flex-col justify-between">
          <button
            onClick={aoFechar}
            className="absolute top-6 right-6 w-8 h-8 rounded-lg text-zinc-500 hover:text-primary dark:hover:text-zinc-200 transition-all bg-zinc-100 dark:bg-zinc-900 border border-borda-sutil flex items-center justify-center"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-borda-sutil flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-primary dark:text-zinc-200 leading-none">Operacional</h3>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Motores base de custeio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {/* Energia */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Energia</span>
                  <span className="text-[7px] font-bold text-zinc-500">Custo por kWh</span>
                </div>
              </div>
              <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-700 overflow-hidden">
                <span className="absolute left-3 font-black text-[10px] text-zinc-400 select-none">R$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={config.custoEnergia === 0 ? "" : (config.custoEnergia / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirCustoEnergia(v);
                    hook.setPrecoKwh(v);
                  }}
                  className="w-full h-10 bg-transparent outline-none pl-9 pr-3 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>

            {/* Margem */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Percent size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Margem Lucro</span>
                  <span className="text-[7px] font-bold text-zinc-500">Padrão do estúdio</span>
                </div>
              </div>
              <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-700 overflow-hidden">
                <input
                  type="number"
                  placeholder="0"
                  value={config.margemLucro === 0 ? "" : (config.margemLucro / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirMargemLucro(v);
                    hook.setMargem(v);
                  }}
                  className="w-full h-10 bg-transparent outline-none pl-3 pr-8 font-bold text-xs text-primary dark:text-white"
                />
                <span className="absolute right-3 font-black text-[10px] text-zinc-400 select-none">%</span>
              </div>
            </div>

            {/* Operador */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Wrench size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Operador</span>
                  <span className="text-[7px] font-bold text-zinc-500">Mão de obra / h</span>
                </div>
              </div>
              <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-700 overflow-hidden">
                <span className="absolute left-3 font-black text-[10px] text-zinc-400 select-none">R$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={config.horaOperador === 0 ? "" : (config.horaOperador / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirHoraOperador(v);
                    hook.setMaoDeObra(v);
                  }}
                  className="w-full h-10 bg-transparent outline-none pl-9 pr-3 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>

            {/* Máquina */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Máquina</span>
                  <span className="text-[7px] font-bold text-zinc-500">Uso do equipamento / h</span>
                </div>
              </div>
              <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-700 overflow-hidden">
                <span className="absolute left-3 font-black text-[10px] text-zinc-400 select-none">R$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={config.horaMaquina === 0 ? "" : (config.horaMaquina / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirHoraMaquina(v);
                    hook.setDepreciacaoHora(v);
                  }}
                  className="w-full h-10 bg-transparent outline-none pl-9 pr-3 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={aoSalvar}
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold uppercase text-[10px] tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Settings size={14} /> Salvar & Sincronizar
            </button>
          </div>

        </div>
      </div>
    </Dialogo>
  );
}
