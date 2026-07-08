import { useState } from "react";
import { Dialogo } from "@/compartilhado/componentes/ui";
import { Sparkles, MapPin, X } from "lucide-react";
import { TARIFAS_KWH_POR_ESTADO, detectarTarifaKwhAutomatico } from "@/compartilhado/utilitarios/tarifas-energia";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoAplicarTarifa: (estado: string, tarifa: number) => void;
}

export function ModalDetectarTarifa({ aberto, aoFechar, aoAplicarTarifa }: Props) {
  const [passo, setPasso] = useState<'consentimento' | 'selecao'>('consentimento');
  const [detectando, setDetectando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const lidarComConsentimento = async () => {
    setDetectando(true);
    setErro(null);
    try {
      const res = await detectarTarifaKwhAutomatico();
      if (res && res.estado && res.tarifa) {
        aoAplicarTarifa(res.estado, res.tarifa);
        aoFechar();
      } else {
        setErro("Não foi possível detectar sua localização automaticamente.");
        setPasso('selecao');
      }
    } catch (e) {
      setErro("Erro ao buscar tarifas.");
      setPasso('selecao');
    } finally {
      setDetectando(false);
    }
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={() => {
        setPasso('consentimento');
        setErro(null);
        aoFechar();
      }}
      titulo={passo === 'consentimento' ? "Detectar Tarifa" : "Selecionar Estado"}
      icone={passo === 'consentimento' ? Sparkles : MapPin}
      larguraMax="max-w-md"
    >
      <div className="p-6 flex flex-col gap-4">
        {passo === 'consentimento' ? (
          <>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center">
              Podemos utilizar o seu IP para descobrir o seu Estado e aplicar a tarifa média residencial (ANEEL) automaticamente?
            </p>
            {erro && <p className="text-[10px] text-red-500 text-center font-bold">{erro}</p>}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={lidarComConsentimento}
                disabled={detectando}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {detectando ? (
                  <Sparkles size={16} className="animate-pulse" />
                ) : (
                  <MapPin size={16} />
                )}
                {detectando ? 'Buscando...' : 'Sim, buscar automaticamente'}
              </button>
              <button
                onClick={() => setPasso('selecao')}
                disabled={detectando}
                className="w-full h-11 bg-muted/50 hover:bg-muted text-primary dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center"
              >
                Não, escolher manualmente
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center">
              Selecione o seu Estado abaixo para aplicar a tarifa média correspondente.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800/50">
              {Object.entries(TARIFAS_KWH_POR_ESTADO).map(([uf, tarifa]) => (
                <button
                  key={uf}
                  onClick={() => {
                    aoAplicarTarifa(uf, tarifa);
                    aoFechar();
                    setPasso('consentimento');
                  }}
                  className="h-10 rounded-lg border border-borda-sutil bg-muted/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center"
                >
                  {uf}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Dialogo>
  );
}
