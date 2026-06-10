import { Cliente } from "../tipos";
import { BaseLegalLGPD } from "@/compartilhado/tipos/modelos";
import { Shield, Info } from "lucide-react";

interface PropriedadesAbaPrivacidade {
  cliente: Cliente;
}

export function AbaPrivacidadeCliente({ cliente }: PropriedadesAbaPrivacidade) {
  // Traduzir base legal para texto legível
  const obterTextoBaseLegal = (base: BaseLegalLGPD) => {
    switch (base) {
      case BaseLegalLGPD.CONSENTIMENTO:
        return "Consentimento explícito do titular";
      case BaseLegalLGPD.EXECUCAO_CONTRATO:
        return "Execução de contrato ou procedimentos preliminares";
      case BaseLegalLGPD.INTERESSE_LEGITIMO:
        return "Legítimo interesse do controlador";
      case BaseLegalLGPD.OBRIGACAO_LEGAL:
        return "Cumprimento de obrigação legal ou regulatória";
      default:
        return base;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Aviso de conformidade LGPD */}
      <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-2xl flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <Shield size={20} />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Conformidade LGPD Ativa</h5>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Este cadastro está em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). As informações coletadas destinam-se exclusivamente para a finalidade descrita.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
            Base Legal Autorizadora
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {obterTextoBaseLegal(cliente.baseLegal || BaseLegalLGPD.EXECUCAO_CONTRATO)}
          </span>
        </div>

        <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
            Prazo de Retenção
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {cliente.prazoRetencaoMeses || 60} meses (5 anos)
          </span>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl space-y-2">
        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
          Finalidade da Coleta
        </span>
        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {cliente.finalidadeColeta || "Gestão de pedidos e orçamentos de impressão 3D."}
        </p>
      </div>

      <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <Info size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Token de Consentimento (Hash ID)</span>
        </div>
        <code className="block text-[10px] font-mono p-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 break-all select-all">
          {cliente.idConsentimento || "Não gerado"}
        </code>
      </div>
      
    </div>
  );
}
