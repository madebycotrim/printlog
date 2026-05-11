import { useState, useEffect } from "react";
import { History, Scale, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Material } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes";
import { ExtratoConsumo } from "./ExtratoConsumo";
import { FormularioConsumo } from "./FormularioConsumo";
import { ConteudoFormularioMaterial } from "./ConteudoFormularioMaterial";
import { CabecalhoModalPremium } from "@/compartilhado/componentes";
import { AbasModalPremium } from "@/compartilhado/componentes";

interface PropriedadesModalHistoricoUso {
  aberto: boolean;
  aoFechar: () => void;
  material: Material | null;
  aoAbater: (quantidade: number, motivo: string) => Promise<void>;
  aoSalvarCadastro: (dados: any) => Promise<void>;
  abaInicial?: "extrato" | "novo" | "cadastro";
}

export function ModalHistoricoUso({
  aberto,
  aoFechar,
  material,
  aoAbater,
  aoSalvarCadastro,
  abaInicial = "extrato"
}: PropriedadesModalHistoricoUso) {
  const [abaAtiva, setAbaAtiva] = useState<"extrato" | "novo" | "cadastro">(abaInicial);
  const [corTemporaria, setCorTemporaria] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setAbaAtiva(abaInicial);
      setCorTemporaria(null);
    }
  }, [aberto, abaInicial]);

  if (!material) return null;

  const corExibicao = corTemporaria || material.cor || "#6366f1";

  const abas = [
    { id: "novo", rotulo: "Abatimento", icone: Scale },
    { id: "extrato", rotulo: "Extrato", icone: History },
    { id: "cadastro", rotulo: "Cadastro", icone: Settings },
  ];

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-3xl" esconderCabecalho={true}>
      <div className="bg-card min-h-[600px] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Cabeçalho Premium Unificado com Aura Dinâmica */}
        <CabecalhoModalPremium 
          titulo={material.nome}
          aoFechar={aoFechar}
          corTema={corExibicao}
          icone={
            <div className="relative">
              <div className="w-3 h-3 rounded-full animate-pulse opacity-50" style={{ backgroundColor: corExibicao }} />
              <div className="absolute inset-0 w-3 h-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)]" style={{ backgroundColor: corExibicao }} />
            </div>
          }
          subtitulo={
            <>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                {material.tipoMaterial}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                {material.fabricante}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado com Cor Dinâmica */}
        <AbasModalPremium 
          abas={abas}
          abaAtiva={abaAtiva}
          aoMudarAba={(id) => setAbaAtiva(id as any)}
          corTema={corExibicao}
        />

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {abaAtiva === "extrato" && (
                <ExtratoConsumo historico={material.historicoUso} corMaterial={corExibicao} />
              )}
              {abaAtiva === "novo" && (
                <FormularioConsumo 
                  pesoDisponivel={material.pesoRestanteGramas} 
                  tipo={material.tipo} 
                  corMaterial={corExibicao}
                  aoSalvar={async (dados) => {
                    await aoAbater(dados.quantidade, dados.motivo);
                    setAbaAtiva("extrato");
                  }} 
                  aoCancelar={aoFechar} 
                />
              )}
              {abaAtiva === "cadastro" && (
                <ConteudoFormularioMaterial 
                  material={material} 
                  corMaterial={corExibicao}
                  aoMudarCor={setCorTemporaria}
                  aoSalvar={aoSalvarCadastro} 
                  aoCancelar={aoFechar} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Dialogo>
  );
}
