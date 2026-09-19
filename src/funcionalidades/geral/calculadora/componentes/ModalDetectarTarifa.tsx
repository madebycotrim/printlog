import { useState } from "react";
import { Dialogo } from "@/compartilhado/componentes/ui";
import { Sparkles, MapPin, Zap, Flame } from "lucide-react";
import { 
  TARIFAS_KWH_POR_ESTADO, 
  obterDadosLocalizacaoCloudflare, 
  BANDEIRAS_TARIFARIAS, 
  TipoBandeiraTarifaria,
  NOMES_ESTADOS,
  calcularTarifaComBandeira
} from "@/compartilhado/utilitarios/tarifas-energia";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoAplicarTarifa: (estado: string, tarifa: number, bandeira?: TipoBandeiraTarifaria) => void;
  estadoAtual?: string;
  bandeiraAtual?: TipoBandeiraTarifaria;
}

export function ModalDetectarTarifa({ aberto, aoFechar, aoAplicarTarifa, estadoAtual = "SP", bandeiraAtual = "amarela" }: Props) {
  const [passo, setPasso] = useState<'consentimento' | 'selecao'>('consentimento');
  const [detectando, setDetectando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [bandeiraSelecionada, setBandeiraSelecionada] = useState<TipoBandeiraTarifaria>(bandeiraAtual);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>(estadoAtual);

  const lidarComConsentimento = async () => {
    setDetectando(true);
    setErro(null);
    try {
      const res = await obterDadosLocalizacaoCloudflare();
      const uf = res?.estado || 'SP';
      setEstadoSelecionado(uf);
      const tarifaTotal = calcularTarifaComBandeira(uf, bandeiraSelecionada);
      
      aoAplicarTarifa(uf, tarifaTotal, bandeiraSelecionada);
      const textoLocal = res?.nomeEstado ? `${res.nomeEstado} (${uf})` : uf;
      const infoBandeira = BANDEIRAS_TARIFARIAS[bandeiraSelecionada]?.nome || '';
      toast.success(`Tarifa de ${textoLocal} (${infoBandeira}) aplicada: R$ ${tarifaTotal.toFixed(3).replace('.', ',')}/kWh`);
      aoFechar();
    } catch {
      const tarifaTotal = calcularTarifaComBandeira('SP', bandeiraSelecionada);
      aoAplicarTarifa('SP', tarifaTotal, bandeiraSelecionada);
      toast.success(`Tarifa de SP aplicada: R$ ${tarifaTotal.toFixed(3).replace('.', ',')}/kWh`);
      aoFechar();
    } finally {
      setDetectando(false);
    }
  };

  const aplicarManual = (uf: string) => {
    setEstadoSelecionado(uf);
    const tarifaTotal = calcularTarifaComBandeira(uf, bandeiraSelecionada);
    aoAplicarTarifa(uf, tarifaTotal, bandeiraSelecionada);
    const nomeUf = NOMES_ESTADOS[uf] || uf;
    toast.success(`Tarifa de ${nomeUf} (${uf}) aplicada: R$ ${tarifaTotal.toFixed(3).replace('.', ',')}/kWh`);
    aoFechar();
    setPasso('consentimento');
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={() => {
        setPasso('consentimento');
        setErro(null);
        aoFechar();
      }}
      titulo={passo === 'consentimento' ? "Tarifa de Energia Inteligente" : "Selecionar Estado"}
      icone={passo === 'consentimento' ? Zap : MapPin}
      larguraMax="max-w-lg"
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Seletor de Bandeira Tarifária ANEEL */}
        <div className="p-4 rounded-2xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white flex items-center gap-1.5">
              <Flame size={13} className="text-amber-500" />
              Bandeira Tarifária ANEEL (Sobretaxa de Estiagem)
            </span>
            <span className="text-[9px] font-bold text-zinc-400">Oficial ANEEL</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(BANDEIRAS_TARIFARIAS) as [TipoBandeiraTarifaria, any][]).filter(([k]) => k !== 'escassez').map(([id, info]) => {
              const ativa = bandeiraSelecionada === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBandeiraSelecionada(id)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    ativa
                      ? 'bg-white dark:bg-zinc-900 border-primary shadow-sm ring-1 ring-primary/20 scale-[1.02]'
                      : 'bg-muted/30 dark:bg-zinc-900/40 border-borda-sutil hover:border-zinc-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.corHex }} />
                    <span className="text-[9px] font-black uppercase tracking-tight text-primary dark:text-white">
                      {info.nome.replace('Bandeira ', '')}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500">
                    {info.adicionalCentavos === 0 ? 'Sem taxa extra' : `+R$ ${info.adicionalReais.toFixed(3)}/kWh`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {passo === 'consentimento' ? (
          <>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
              Detectamos automaticamente sua localização via backend Cloudflare para carregar a tarifa residencial da distribuidora do seu estado somada à bandeira selecionada.
            </p>
            {erro && <p className="text-[10px] text-red-500 text-center font-bold">{erro}</p>}
            <div className="flex flex-col gap-2.5 mt-1">
              <button
                onClick={lidarComConsentimento}
                disabled={detectando}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {detectando ? (
                  <Sparkles size={16} className="animate-pulse" />
                ) : (
                  <MapPin size={16} />
                )}
                {detectando ? 'Buscando Localização...' : 'Sim, detectar Estado pelo IP'}
              </button>
              <button
                onClick={() => setPasso('selecao')}
                disabled={detectando}
                className="w-full h-11 bg-muted/50 hover:bg-muted text-primary dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center cursor-pointer border border-borda-sutil"
              >
                Não, escolher Estado manualmente
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center">
              Selecione o seu Estado abaixo para aplicar a tarifa média correspondente com a bandeira selecionada.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(TARIFAS_KWH_POR_ESTADO).map(([uf, tarifaBase]) => {
                const tarifaFinal = tarifaBase + (BANDEIRAS_TARIFARIAS[bandeiraSelecionada]?.adicionalReais || 0);
                const selecionado = estadoSelecionado === uf;
                return (
                  <button
                    key={uf}
                    onClick={() => aplicarManual(uf)}
                    className={`h-11 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selecionado 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20 scale-[1.02]' 
                        : 'border-borda-sutil bg-muted/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-primary dark:text-zinc-200'
                    }`}
                  >
                    <span>{uf}</span>
                    <span className={`text-[8px] font-bold ${selecionado ? 'text-white/80' : 'text-zinc-400'}`}>
                      R$ {tarifaFinal.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPasso('consentimento')}
              className="text-[9px] font-bold text-zinc-400 hover:text-primary dark:hover:text-white text-center uppercase tracking-wider"
            >
              ← Voltar para detecção automática
            </button>
          </>
        )}
      </div>
    </Dialogo>
  );
}
