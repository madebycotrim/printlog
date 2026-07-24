import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Rodapé de Transparência e Conformidade Jurídica exigido pelo Decreto do E-commerce (Decreto nº 7.962/2013)
 * e pelo Código de Defesa do Consumidor (Lei nº 8.078/1990).
 */
export function RodapeConformidade() {
  return (
    <footer className="w-full py-8 px-6 border-t border-borda-sutil bg-card text-zinc-400 text-[11px] mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 font-black uppercase text-primary dark:text-white tracking-wider text-xs">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>PrintLog Tecnologia & Precificação 3D Ltda.</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            Suporte: contato@printlog.com.br • DPO: dpo@printlog.com.br
          </p>
          <p className="text-[9px] text-zinc-500">
            Conforme o Art. 49 do CDC, compras e assinaturas digitais possuem 7 dias para direito de arrependimento e reembolso integral.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider">
          <Link to="/termos" className="hover:text-primary dark:hover:text-white transition-colors">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-primary dark:hover:text-white transition-colors">
            Privacidade
          </Link>
          <Link to="/cookies" className="hover:text-primary dark:hover:text-white transition-colors">
            Política de Cookies
          </Link>
          <Link to="/gestao-dados" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>Gestão LGPD</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
