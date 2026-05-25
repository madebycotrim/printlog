import { useState, useEffect, useMemo } from "react";
import { History, Settings, Package, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Insumo } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes";
import { CabecalhoModalPremium } from "@/compartilhado/componentes";
import { AbasModalPremium } from "@/compartilhado/componentes";
import { AbaHistoricoInsumo } from "./gerenciamento/AbaHistoricoInsumo";
import { AbaConfiguracaoInsumo } from "./gerenciamento/AbaConfiguracaoInsumo";
import { AbaOperacoesInsumo } from "./gerenciamento/AbaOperacoesInsumo";
import { CategoriaInsumo } from "../tipos";

interface PropriedadesModalGerenciamento {
  aberto: boolean;
  aoFechar: () => void;
  insumo: Insumo | null;
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
  aoBaixar: (insumo: Insumo) => void;
  aoRepor: (insumo: Insumo) => void;
  abaInicial?: "estoque" | "historico" | "config";
}

const MAPA_CORES_CATEGORIA: Record<CategoriaInsumo, string> = {
  Limpeza: "sky-500",
  Embalagem: "amber-500",
  Embrulho: "pink-500",
  Fixação: "red-500",
  Eletrônica: "violet-500",
  Acabamento: "emerald-500",
  Proteção: "teal-500",
  Geral: "zinc-500",
  Outros: "stone-500",
};

const MAPA_CORES_HEX: Record<CategoriaInsumo, string> = {
  Limpeza: "#0ea5e9", // sky-500
  Embalagem: "#f59e0b", // amber-500
  Embrulho: "#ec4899", // pink-500
  Fixação: "#ef4444", // red-500
  Eletrônica: "#8b5cf6", // violet-500
  Acabamento: "#10b981", // emerald-500
  Proteção: "#14b8a6", // teal-500
  Geral: "#71717a", // zinc-500
  Outros: "#78716c", // stone-500
};

export function ModalGerenciamentoInsumo({
  aberto,
  aoFechar,
  insumo,
  aoSalvar,
  aoBaixar,
  aoRepor,
  abaInicial = "estoque"
}: PropriedadesModalGerenciamento) {
  const insumoPadrao: Insumo = useMemo(() => ({
    id: "",
    nome: "",
    categoria: "Geral",
    unidadeMedida: "un",
    quantidadeAtual: "" as unknown as number,
    quantidadeMinima: "" as unknown as number,
    custoMedioUnidade: "" as unknown as number,
    historico: [],
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  }), []);

  const insumoEfetivo = insumo || insumoPadrao;

  const [abaAtiva, setAbaAtiva] = useState<"estoque" | "historico" | "config">(abaInicial);
  const [categoriaTemp, setCategoriaTemp] = useState<CategoriaInsumo | null>(null);

  useEffect(() => {
    if (aberto) {
      setAbaAtiva(abaInicial);
      setCategoriaTemp(insumoEfetivo.categoria || null);
    }
  }, [aberto, abaInicial, insumoEfetivo]);

  if (!aberto) return null;

  const categoriaEfetiva = categoriaTemp || insumoEfetivo.categoria;
  const corTema = MAPA_CORES_CATEGORIA[categoriaEfetiva] || "sky-500";
  const corHex = MAPA_CORES_HEX[categoriaEfetiva] || "#0ea5e9";

  const abas = [
    { id: "estoque", rotulo: "Operações", icone: Database },
    { id: "historico", rotulo: "Histórico", icone: History },
    { id: "config", rotulo: "Configurações", icone: Settings },
  ].filter(aba => {
    if (!insumo) return aba.id === "config";
    return true;
  });

  const esconderAbas = !insumo;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-4xl" esconderCabecalho={true}>
      <div className="bg-white dark:bg-[#0a0a0a] min-h-[600px] flex flex-col overflow-hidden rounded-2xl shadow-2xl relative">
        
        {/* Aura de fundo dinâmica interna com cor HEX */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 blur-[120px] opacity-[0.05] pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: corHex }}
        />

        {/* Cabeçalho Premium Unificado */}
        <CabecalhoModalPremium 
          titulo={insumoEfetivo.nome || "Novo Insumo"}
          aoFechar={aoFechar}
          corTema={corTema}
          icone={<Package size={28} className={`text-${corTema} transition-colors duration-500`} strokeWidth={2.5} />}
          subtitulo={
            <>
              <span className={`text-[10px] font-black text-${corTema} uppercase tracking-[0.2em] transition-colors duration-500`}>
                {categoriaEfetiva}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                {insumoEfetivo.marca || "Genérico"}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado */}
        {!esconderAbas && (
          <AbasModalPremium 
            abas={abas}
            abaAtiva={abaAtiva}
            aoMudarAba={(id) => setAbaAtiva(id as any)}
            corTema={corTema}
          />
        )}

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {abaAtiva === "estoque" && (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AbaOperacoesInsumo 
                    insumo={insumoEfetivo} 
                    aoBaixar={() => {
                      aoFechar();
                      setTimeout(() => aoBaixar(insumoEfetivo), 100);
                    }}
                    aoRepor={() => {
                      aoFechar();
                      setTimeout(() => aoRepor(insumoEfetivo), 100);
                    }}
                    corTema={corTema}
                  />
                </div>
              )}
              {abaAtiva === "historico" && (
                <div className="p-8">
                  <AbaHistoricoInsumo insumo={insumoEfetivo} />
                </div>
              )}
              {abaAtiva === "config" && (
                <div className="p-8">
                  <AbaConfiguracaoInsumo 
                    insumo={insumoEfetivo} 
                    aoSalvar={aoSalvar}
                    aoCancelar={aoFechar}
                    corTema={corTema}
                    aoMudarCategoriaInterna={setCategoriaTemp}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Dialogo>
  );
}
