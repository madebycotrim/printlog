import { useState, useEffect } from "react";
import { History, Shield, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Cliente } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes";
import { CabecalhoModalPremium } from "@/compartilhado/componentes";
import { AbasModalPremium } from "@/compartilhado/componentes";
import { AbaHistoricoCliente } from "./AbaHistoricoCliente";
import { AbaPrivacidadeCliente } from "./AbaPrivacidadeCliente";
import { FormularioClienteConteudo } from "./FormularioClienteConteudo";

interface PropriedadesModalGerenciamentoCliente {
  aberto: boolean;
  aoFechar: () => void;
  cliente: Cliente | null;
  aoSalvar: (dados: Partial<Cliente>) => Promise<any>;
}

export function ModalGerenciamentoCliente({
  aberto,
  aoFechar,
  cliente,
  aoSalvar,
}: PropriedadesModalGerenciamentoCliente) {
  const [abaAtiva, setAbaAtiva] = useState<"historico" | "privacidade" | "config">("historico");

  useEffect(() => {
    if (aberto) {
      setAbaAtiva("historico");
    }
  }, [aberto, cliente]);

  if (!cliente) return null;

  const abas = [
    { id: "historico", rotulo: "Histórico", icone: History },
    { id: "privacidade", rotulo: "Privacidade (LGPD)", icone: Shield },
    { id: "config", rotulo: "Especificações", icone: Settings },
  ];

  const obterIniciais = (nome: string) => {
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-4xl" esconderCabecalho={true}>
      <div className="bg-white dark:bg-[#121214] min-h-[650px] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Cabeçalho Premium Unificado */}
        <CabecalhoModalPremium 
          titulo={cliente.nome}
          aoFechar={aoFechar}
          corTema="indigo-500"
          icone={
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              {obterIniciais(cliente.nome)}
            </div>
          }
          subtitulo={
            <>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                {cliente.tipo || "B2C"}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {cliente.email || "Sem e-mail"}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado */}
        <AbasModalPremium 
          abas={abas}
          abaAtiva={abaAtiva}
          aoMudarAba={(id) => setAbaAtiva(id as any)}
          corTema="indigo-500"
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
              {abaAtiva === "historico" && (
                <AbaHistoricoCliente cliente={cliente} />
              )}
              {abaAtiva === "privacidade" && (
                <AbaPrivacidadeCliente cliente={cliente} />
              )}
              {abaAtiva === "config" && (
                <FormularioClienteConteudo 
                  clienteEditando={cliente} 
                  aoSalvar={aoSalvar} 
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
