import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Estudio } from "@/compartilhado/tipos/modelos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface ContextoEstudioProps {
  estudioAtivo: Estudio | null;
  estudios: Estudio[];
  definirEstudioAtivo: (id: string) => void;
  carregando: boolean;
}

const ContextoEstudio = createContext<ContextoEstudioProps>({
  estudioAtivo: null,
  estudios: [],
  definirEstudioAtivo: () => {},
  carregando: true,
});

export function usarEstudio() {
  return useContext(ContextoEstudio);
}

const CHAVE_STORAGE = "printlog:id_estudio_ativo" as const;
const CHAVE_ESTUDIOS = "printlog:estudios" as const;

/**
 * Provedor de Contexto para Gestão de Estúdios (Multi-Tenant Preparatory Layer).
 * @fase 3 - Roadmap
 */
export function ProvedorEstudio({ children }: { children: ReactNode }) {
  const [estudios, definirEstudios] = useState<Estudio[]>([]);
  const [estudioAtivo, definirEstudioAtivoInterno] = useState<Estudio | null>(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    const inicializarEstudios = () => {
      const salvo = localStorage.getItem(CHAVE_ESTUDIOS);
      let listaEstudios: Estudio[] = [];

      if (salvo) {
        listaEstudios = JSON.parse(salvo);
      } else {
        // Estúdio Padrão (Seed)
        listaEstudios = [
          {
            id: "estudio-principal",
            nome: "Estúdio Principal",
            slug: "principal",
            corPrimaria: "sky",
            dataCriacao: new Date(),
          },
          {
            id: "laboratorio-prototipos",
            nome: "Lab de Protótipos",
            slug: "lab",
            corPrimaria: "emerald",
            dataCriacao: new Date(),
          },
        ];
        localStorage.setItem(CHAVE_ESTUDIOS, JSON.stringify(listaEstudios));
      }

      const idAtivo = localStorage.getItem(CHAVE_STORAGE) || listaEstudios[0].id;
      const ativo = listaEstudios.find((e) => e.id === idAtivo) || listaEstudios[0];

      definirEstudios(listaEstudios);
      definirEstudioAtivoInterno(ativo);
      definirCarregando(false);

      registrar.info({ rastreioId: "sistema", idEstudio: ativo.id }, "Contexto de Estúdio Inicializado");
    };

    inicializarEstudios();
  }, []);

  const selecionarEstudio = (id: string) => {
    const novoAtivo = estudios.find((e) => e.id === id);
    if (novoAtivo) {
      localStorage.setItem(CHAVE_STORAGE, id);
      definirEstudioAtivoInterno(novoAtivo);
      registrar.info({ rastreioId: "sistema", novoEstudio: id }, "Troca de Estúdio Realizada");

      // Força recarregamento para garantir que todos os stores filtrem pelo novo tenant
      window.location.reload();
    }
  };

  const valor = {
    estudioAtivo,
    estudios,
    definirEstudioAtivo: selecionarEstudio,
    carregando,
  };

  return <ContextoEstudio.Provider value={valor}>{children}</ContextoEstudio.Provider>;
}
