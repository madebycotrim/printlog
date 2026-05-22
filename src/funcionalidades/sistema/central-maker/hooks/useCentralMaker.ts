import { useState, useMemo } from "react";
import { WIKI_EXTENDIDA, FAQS, InterfaceTopico } from "../utilitarios/dados";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { MessageCircle } from "lucide-react";

export function useCentralMaker() {
  const [busca, definirBusca] = useState("");
  const [abrirSuporte, definirAbrirSuporte] = useState(false);
  const [topicoSelecionado, definirTopicoSelecionado] = useState<InterfaceTopico | null>(null);

  const wikiFiltrada = useMemo(() => {
    const termo = busca.toLowerCase();
    return WIKI_EXTENDIDA.map((categoria) => ({
      ...categoria,
      topicos: categoria.topicos.filter(
        (t) => t.titulo.toLowerCase().includes(termo) || t.conteudo.toLowerCase().includes(termo),
      ),
    })).filter((c) => c.topicos.length > 0 || busca === "");
  }, [busca]);

  const faqsFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return FAQS.filter((f) => f.pergunta.toLowerCase().includes(termo) || f.resposta.toLowerCase().includes(termo));
  }, [busca]);

  const todosTopicosEncontrados = useMemo(() => {
    if (!busca) return [];
    const termo = busca.toLowerCase();
    return WIKI_EXTENDIDA.flatMap((c) =>
      c.topicos
        .filter((t) => t.titulo.toLowerCase().includes(termo) || t.conteudo.toLowerCase().includes(termo))
        .map((t) => ({ ...t, categoria: c.titulo, cor: c.cor })),
    );
  }, [busca]);

  useDefinirCabecalho({
    titulo: "Central Maker",
    subtitulo: "Hub de inteligência técnica e suporte estratégico",
    placeholderBusca: "PESQUISAR MANUAIS OU DÚVIDAS TÉCNICAS...",
    aoBuscar: (t) => definirBusca(t),
    acao: {
      texto: "Canais de Suporte",
      icone: MessageCircle,
      aoClicar: () => definirAbrirSuporte(true),
    },
  });

  return {
    busca,
    definirBusca,
    abrirSuporte,
    definirAbrirSuporte,
    topicoSelecionado,
    definirTopicoSelecionado,
    wikiFiltrada,
    faqsFiltradas,
    todosTopicosEncontrados,
  };
}
