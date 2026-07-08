import { Crown, Settings, Zap, Percent, Wrench, Clock, X } from "lucide-react";
import { Dialogo, InputBancario } from "@/compartilhado/componentes";
import { EstadoCalculadora } from "../estado/armazemCalculadora";

interface PropriedadesModalConfiguracoesV2 {
  aberto: boolean;
  aoFechar: () => void;
  eProOuSuperior: boolean;
  config: any;
  armazem: EstadoCalculadora;
  aoSalvar: () => Promise<void>;
  aoClicarPaywall?: () => void;
}

export function ModalConfiguracoesV2({
  aberto,
  aoFechar,
  eProOuSuperior,
  config,
  armazem,
  aoSalvar,
  aoClicarPaywall
}: PropriedadesModalConfiguracoesV2) {
  return (
    <Dialogo 
      aberto={aberto} 
      aoFechar={aoFechar} 
      larguraMax="max-w-4xl" 
      titulo="Configurações da Calculadora"
      subtitulo="Personalize orçamentos e operacional"
      icone={Settings}
    >
      <div className="flex flex-col md:flex-row relative w-full h-full min-h-[50vh]">
        
        {/* PAINEL ESQUERDO: IDENTIDADE (PDF) */}
        <div className="w-full md:w-2/5 p-8 bg-zinc-50 dark:bg-zinc-900/50 relative flex flex-col border-b md:border-b-0 md:border-r border-borda-sutil">
          <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Crown size={16} className="text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Personalizar Orçamento</h3>
              </div>

              <div className={`space-y-4 transition-all ${!eProOuSuperior ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Nome do Estúdio</label>
                  <input
                    type="text"
                    placeholder="Ex: PrintPro Lab"
                    value={config.nomeEstudio || ""}
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio, config.logoEstudio)}
                    className="w-full h-12 bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl px-4 text-xs font-bold text-primary dark:text-white focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Slogan / Frase de Rodapé</label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio || ""}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value, config.logoEstudio)}
                    className="w-full h-12 bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl px-4 text-xs font-bold text-primary dark:text-white focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">URL da Logo (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={config.logoEstudio || ""}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, config.sloganEstudio, e.target.value)}
                    className="w-full h-12 bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl px-4 text-xs font-bold text-primary dark:text-white focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Preview Dinâmico do Rodapé PRO */}
            {eProOuSuperior && (
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-borda-sutil flex flex-col gap-1 mt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-borda-sutil pb-1.5 mb-1">
                  Pré-Visualização
                </span>
                <div className="flex items-center gap-3 mt-1">
                  {config.logoEstudio && (
                    <img src={config.logoEstudio} alt="Logo" className="max-h-8 w-auto object-contain rounded" />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-primary dark:text-zinc-200 truncate">
                      {config.nomeEstudio || "Seu Estúdio"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 italic truncate">
                      {config.sloganEstudio || "Seu slogan aqui"}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
          
          <div className="relative z-10 mt-6 flex justify-between items-center text-[8px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest pt-4 border-t border-borda-sutil">
            <span>PrintLog OS</span>
            <span>2026</span>
          </div>

          {!eProOuSuperior && (
            <div 
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-100/80 dark:bg-zinc-950/80 backdrop-blur-sm text-center gap-2 cursor-pointer"
              onClick={aoClicarPaywall}
            >
              <Crown size={24} className="text-zinc-400 dark:text-zinc-500" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Exclusivo PRO</span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Personalize seus orçamentos
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PAINEL DIREITO: MOTORES OPERACIONAIS */}
        <div className="w-full md:w-3/5 p-8 bg-card relative flex flex-col justify-between">

          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Operacional</h3>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">Motores base de custeio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {/* Energia */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white">Energia</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Custo por kWh</span>
                </div>
              </div>
              <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/10 overflow-hidden shadow-inner transition-all h-12">
                <span className="absolute left-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">R$</span>
                <InputBancario
                  placeholder="0.00"
                  value={config.custoEnergia === 0 ? "" : (config.custoEnergia / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirCustoEnergia(v);
                    armazem.setParametro("precoKwhCentavos", v);
                  }}
                  className="w-full h-full bg-transparent outline-none pl-9 pr-4 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>

            {/* Margem */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Percent size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white">Margem Lucro</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Padrão do estúdio</span>
                </div>
              </div>
              <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/10 overflow-hidden shadow-inner transition-all h-12">
                <input
                  type="number"
                  placeholder="0"
                  value={config.margemLucro === 0 ? "" : (config.margemLucro / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirMargemLucro(v);
                    armazem.setParametro("margemLucroPercentual", v);
                  }}
                  className="w-full h-full bg-transparent outline-none pl-4 pr-8 font-bold text-xs text-primary dark:text-white"
                />
                <span className="absolute right-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">%</span>
              </div>
            </div>

            {/* Operador */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Wrench size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white">Operador</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Mão de obra / h</span>
                </div>
              </div>
              <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/10 overflow-hidden shadow-inner transition-all h-12">
                <span className="absolute left-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">R$</span>
                <InputBancario
                  placeholder="0.00"
                  value={config.horaOperador === 0 ? "" : (config.horaOperador / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirHoraOperador(v);
                    armazem.setParametro("maoDeObraHoraCentavos", v);
                  }}
                  className="w-full h-full bg-transparent outline-none pl-9 pr-4 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>

            {/* Máquina */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-borda-sutil flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white">Máquina</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Uso do equipamento / h</span>
                </div>
              </div>
              <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/10 overflow-hidden shadow-inner transition-all h-12">
                <span className="absolute left-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">R$</span>
                <InputBancario
                  placeholder="0.00"
                  value={config.horaMaquina === 0 ? "" : (config.horaMaquina / 100)}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value) * 100);
                    config.definirHoraMaquina(v);
                    armazem.setParametro("depreciacaoHoraCentavos", v);
                  }}
                  className="w-full h-full bg-transparent outline-none pl-9 pr-4 font-bold text-xs text-primary dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={aoSalvar}
              className="w-full h-12 bg-sky-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-400 cursor-pointer"
            >
              <Settings size={14} /> Salvar & Sincronizar
            </button>
          </div>

        </div>
      </div>
    </Dialogo>
  );
}
