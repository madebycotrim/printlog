import { useState, useEffect } from "react";
import { Activity, Wrench, Settings, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Impressora } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { AbaProducaoImpressora } from "./AbaProducaoImpressora";
import { AbaManutencaoImpressora } from "./AbaManutencaoImpressora";
import { ConteudoFormularioImpressora } from "./ConteudoFormularioImpressora";
import { CabecalhoModalPremium } from "@/compartilhado/componentes/CabecalhoModalPremium";
import { AbasModalPremium } from "@/compartilhado/componentes/AbasModalPremium";

interface PropriedadesModalGerenciamento {
  aberto: boolean;
  aoFechar: () => void;
  impressora: Impressora | null;
  aoSalvarCadastro: (dados: Impressora) => Promise<any> | void;
  abaInicial?: "producao" | "manutencao" | "config";
}

export function ModalGerenciamentoImpressora({
  aberto,
  aoFechar,
  impressora,
  aoSalvarCadastro,
  abaInicial = "manutencao"
}: PropriedadesModalGerenciamento) {
  const [abaAtiva, setAbaAtiva] = useState<"producao" | "manutencao" | "config">(abaInicial);

  useEffect(() => {
    if (aberto) {
      setAbaAtiva(abaInicial);
    }
  }, [aberto, abaInicial]);

  if (!impressora) return null;

  const abas = [
    { id: "manutencao", rotulo: "Manutenção", icone: Wrench },
    { id: "producao", rotulo: "Produção", icone: Activity },
    { id: "config", rotulo: "Especificações", icone: Settings },
  ];

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-4xl" esconderCabecalho={true}>
      <div className="bg-card min-h-[650px] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Cabeçalho Premium Unificado */}
        <CabecalhoModalPremium 
          titulo={impressora.nome}
          aoFechar={aoFechar}
          corTema="sky-500"
          icone={
            impressora.imagemUrl ? (
              <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[80%] h-[80%] object-contain" />
            ) : (
              <Printer size={24} className="text-muted-foreground" />
            )
          }
          subtitulo={
            <>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">
                {impressora.tecnologia}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {impressora.marca} {impressora.modeloBase}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado */}
        <AbasModalPremium 
          abas={abas}
          abaAtiva={abaAtiva}
          aoMudarAba={(id) => setAbaAtiva(id as any)}
          corTema="sky-500"
        />

        {/* Conteúdo Dinâmico */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col ${abaAtiva === "config" ? "p-0" : "p-8"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {abaAtiva === "producao" && (
                <AbaProducaoImpressora impressora={impressora} />
              )}
              {abaAtiva === "manutencao" && (
                <AbaManutencaoImpressora impressora={impressora} />
              )}
              {abaAtiva === "config" && (
                <ConteudoFormularioImpressora 
                  impressora={impressora} 
                  aoSalvar={async (dados) => {
                    await aoSalvarCadastro(dados);
                  }} 
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
