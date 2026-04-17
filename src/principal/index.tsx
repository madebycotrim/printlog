import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RoteadorPrincipal } from "@/configuracoes/rotas";
import { ProvedorTema } from "@/configuracoes/tema/tema_provider";

import "@/index.css";
import "@/configuracoes/tema/tema.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProvedorTema>
      <RoteadorPrincipal />
    </ProvedorTema>
  </StrictMode>,
);
