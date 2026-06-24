import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RoteadorPrincipal } from "@/configuracoes/rotas";
import { ProvedorTema } from "@/configuracoes/tema/tema_provider";
import { ShieldAlert } from "lucide-react";
import { CONFIGURACAO_INVALIDA } from "@/compartilhado/servicos/firebase";

import "@/index.css";
import "@/configuracoes/tema/tema.css";
import { gerenciadorConsentimento } from "@/compartilhado/utilitarios/gerenciador-consentimento";

// Inicializa o bloqueio de serviços baseado no consentimento salvo
gerenciadorConsentimento.ativarIntercepetorRede();
gerenciadorConsentimento.sincronizarServicos();

function TelaErroConfiguracao() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 p-6">
      <div className="max-w-md w-full p-8 bg-card border border-borda-sutil rounded-[2rem] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-white">Configuração Ausente</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          O aplicativo não pode ser iniciado porque as credenciais obrigatórias do Firebase estão ausentes no arquivo <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold">.env</code>.
        </p>
        <div className="text-left bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl space-y-2 text-[11px] font-mono">
          <p className="font-bold text-zinc-600 dark:text-zinc-400">Variáveis Obrigatórias:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-300">
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
          </ul>
        </div>
        <p className="text-[10px] text-zinc-400">
          Consulte o arquivo <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold">.env.example</code> para configurar seu ambiente local.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProvedorTema>
      {CONFIGURACAO_INVALIDA ? <TelaErroConfiguracao /> : <RoteadorPrincipal />}
    </ProvedorTema>
  </StrictMode>,
);

