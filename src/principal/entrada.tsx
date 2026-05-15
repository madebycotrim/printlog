import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RoteadorPrincipal } from "@/configuracoes/rotas";
import { ProvedorTema } from "@/configuracoes/tema/tema_provider";

import "@/index.css";
import "@/configuracoes/tema/tema.css";
import { gerenciadorConsentimento } from "@/compartilhado/utilitarios/gerenciador-consentimento";

// Inicializa o bloqueio de serviços baseado no consentimento salvo
gerenciadorConsentimento.ativarIntercepetorRede();
gerenciadorConsentimento.sincronizarServicos();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProvedorTema>
      <RoteadorPrincipal />
    </ProvedorTema>
  </StrictMode>,
);
