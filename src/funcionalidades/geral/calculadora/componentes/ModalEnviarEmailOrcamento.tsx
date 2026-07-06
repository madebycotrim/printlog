import { Dialogo } from "@/compartilhado/componentes";
import { Mail, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";

interface PropriedadesModalEnviarEmail {
  aberto: boolean;
  aoFechar: () => void;
  linkMagico: string | null;
  nomeProjeto: string;
  valorTotal: string;
}

export function ModalEnviarEmailOrcamento({
  aberto,
  aoFechar,
  linkMagico,
  nomeProjeto,
  valorTotal
}: PropriedadesModalEnviarEmail) {
  const [emailCliente, setEmailCliente] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const config = useArmazemConfiguracoes();

  const enviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCliente || !linkMagico) {
      toast.error("O E-mail do cliente e o Link Mágico são obrigatórios.");
      return;
    }

    setEnviando(true);
    
    // Obter o nome do estúdio configurado no banco de dados (Zustand / Cloudflare D1)
    const nomeEstudio = config.nomeEstudio || "Estúdio Maker";

    try {
      // Como estamos rodando com Vite e proxy em dev:live, bate na rota /api/email/enviar-orcamento
      const resposta = await fetch("/api/email/enviar-orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailDestino: emailCliente,
          nomeCliente: nomeCliente,
          nomeEstudio: nomeEstudio,
          linkMagico: linkMagico,
          valorTotal: valorTotal,
          nomeProjeto: nomeProjeto
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Falha na API de e-mail");
      }

      setSucesso(true);
      toast.success(dados.mock ? "E-mail simulado com sucesso (Modo Offline)" : "Orçamento enviado com sucesso!");
    } catch (erro: any) {
      toast.error(erro.message || "Erro ao tentar enviar o e-mail.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} esconderCabecalho>
      <div className="p-6 md:p-8 max-w-md w-full bg-white dark:bg-slate-900 border border-borda-sutil dark:border-slate-800 rounded-2xl relative shadow-2xl">
        <button
          onClick={aoFechar}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-zinc-100/50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {!sucesso ? (
          <>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
              <Mail size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Enviar Orçamento</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Vamos enviar um e-mail profissional com o Link Mágico do orçamento diretamente para o seu cliente.
            </p>

            <form onSubmit={enviarEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Nome do Cliente (Opcional)
                </label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-borda-sutil dark:border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  E-mail do Cliente *
                </label>
                <input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="cliente@email.com"
                  required
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-borda-sutil dark:border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <button
                type="submit"
                disabled={enviando || !emailCliente}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {enviando ? "Enviando..." : (
                  <>
                    Disparar E-mail
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
              <Mail size={32} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">E-mail Enviado!</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-[250px] mx-auto">
              O orçamento foi enviado para <strong>{emailCliente}</strong> com sucesso.
            </p>
            <button
              onClick={aoFechar}
              className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-borda-sutil dark:border-white/5 text-zinc-900 dark:text-white font-bold py-3 rounded-xl transition-all"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </Dialogo>
  );
}
