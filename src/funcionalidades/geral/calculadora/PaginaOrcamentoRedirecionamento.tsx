import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";

export function PaginaOrcamentoRedirecionamento() {
  const { id } = useParams<{ id: string }>();
  const [erro, setErro] = useState<string | null>(null);
  const navegar = useNavigate();

  useEffect(() => {
    if (!id) {
      setErro("Identificador da proposta não fornecido.");
      return;
    }

    // Busca a URL original correspondente ao ID encurtado
    fetch(`/api/publico/encurtador?id=${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Proposta comercial não encontrada ou expirada.");
          }
          throw new Error("Erro ao carregar a proposta encurtada.");
        }
        return res.json();
      })
      .then((dados) => {
        if (dados.urlOriginal) {
          // Faz o redirecionamento limpo substituindo o histórico de navegação
          window.location.replace(dados.urlOriginal);
        } else {
          throw new Error("Endereço original inválido.");
        }
      })
      .catch((err) => {
        console.error("[redirecionador] Erro:", err);
        setErro(err.message || "Erro desconhecido ao processar redirecionamento.");
      });
  }, [id]);

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] text-neutral-900 p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldAlert size={22} />
          </div>
          <h1 className="text-sm font-black uppercase tracking-wider text-neutral-800">Proposta Inválida</h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            {erro}
          </p>
          <button
            onClick={() => navegar("/")}
            className="mt-2 px-5 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-all"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa] text-neutral-900 font-sans gap-4">
      <div className="relative">
        <Loader2 size={36} className="text-neutral-900 animate-spin" />
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Carregando Proposta</span>
        <span className="text-xs font-bold text-neutral-600">Buscando detalhes do orçamento...</span>
      </div>
    </div>
  );
}
