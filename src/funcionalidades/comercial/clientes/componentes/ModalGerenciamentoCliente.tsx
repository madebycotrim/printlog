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
  abaInicial?: "historico" | "privacidade" | "config";
}

export function ModalGerenciamentoCliente({
  aberto,
  aoFechar,
  cliente,
  aoSalvar,
  abaInicial = "historico",
}: PropriedadesModalGerenciamentoCliente) {
  const [abaAtiva, setAbaAtiva] = useState<"historico" | "privacidade" | "config">(abaInicial);

  useEffect(() => {
    if (aberto) {
      setAbaAtiva(!cliente ? "config" : abaInicial);
    }
  }, [aberto, abaInicial, cliente]);

  const abas = cliente?.id ? [
    { id: "historico", rotulo: "Histórico", icone: History },
    { id: "privacidade", rotulo: "Privacidade (LGPD)", icone: Shield },
    { id: "config", rotulo: "Especificações", icone: Settings },
  ] : [
    { id: "config", rotulo: "Dados do Cliente", icone: Settings },
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
      <div className="bg-white dark:bg-[#121214] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        <CabecalhoModalPremium 
          titulo={cliente?.nome || "Novo Cadastro"}
          aoFechar={aoFechar}
          corTema="indigo-500"
          icone={
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              {obterIniciais(cliente?.nome || "NC")}
            </div>
          }
          subtitulo={
            <>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                {cliente?.tipo || "NOVO"}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {cliente?.email || "Cadastro Manual"}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado (Apenas para edição) */}
        {cliente?.id && (
          <AbasModalPremium 
            abas={abas}
            abaAtiva={abaAtiva}
            aoMudarAba={(id) => setAbaAtiva(id as any)}
            corTema="indigo-500"
          />
        )}

        {/* Conteúdo Dinâmico */}
        <div className={`flex-1 overflow-hidden flex flex-col ${abaAtiva === "config" ? "p-0" : "p-8"}`}>
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
                <AbaHistoricoCliente cliente={cliente as Cliente} />
              )}
              {abaAtiva === "privacidade" && (
                <AbaPrivacidadeCliente cliente={cliente as Cliente} />
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
