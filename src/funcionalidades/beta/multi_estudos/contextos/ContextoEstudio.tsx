import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Estudio, CorPrimaria, MembroEstudio } from "@/compartilhado/tipos/modelos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "sonner";

interface ContextoEstudioProps {
  estudioAtivo: Estudio | null;
  estudios: Estudio[];
  definirEstudioAtivo: (id: string) => void;
  criarEstudio: (nome: string, corPrimaria?: CorPrimaria) => Promise<Estudio>;
  removerEstudio: (id: string) => Promise<void>;
  adicionarMembro: (estudioId: string, email: string, papel?: "OPERADOR" | "ADMIN") => Promise<void>;
  removerMembro: (estudioId: string, email: string) => Promise<void>;
  carregando: boolean;
}

const ContextoEstudio = createContext<ContextoEstudioProps>({
  estudioAtivo: null,
  estudios: [],
  definirEstudioAtivo: () => {},
  criarEstudio: async () => ({} as Estudio),
  removerEstudio: async () => {},
  adicionarMembro: async () => {},
  removerMembro: async () => {},
  carregando: true,
});

export function useEstudio() {
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
        try {
          listaEstudios = JSON.parse(salvo);
        } catch {
          listaEstudios = [];
        }
      }

      if (!listaEstudios || listaEstudios.length === 0) {
        // Estúdio Padrão (Seed)
        listaEstudios = [
          {
            id: "estudio-principal",
            nome: "Estúdio Principal",
            slug: "principal",
            corPrimaria: "sky",
            dataCriacao: new Date(),
            membros: [
              { email: "admin@printlog.com.br", papel: "ADMIN", dataEntrada: new Date().toISOString() }
            ]
          },
          {
            id: "laboratorio-prototipos",
            nome: "Lab de Protótipos",
            slug: "lab",
            corPrimaria: "emerald",
            dataCriacao: new Date(),
            membros: []
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

  const salvarEstudiosNoStorage = (novosEstudios: Estudio[]) => {
    definirEstudios(novosEstudios);
    localStorage.setItem(CHAVE_ESTUDIOS, JSON.stringify(novosEstudios));
  };

  const selecionarEstudio = useCallback((id: string) => {
    const novoAtivo = estudios.find((e) => e.id === id);
    if (novoAtivo) {
      localStorage.setItem(CHAVE_STORAGE, id);
      definirEstudioAtivoInterno(novoAtivo);
      registrar.info({ rastreioId: "sistema", novoEstudio: id }, "Troca de Estúdio Realizada");
      toast.success(`Estúdio ativo alterado para: ${novoAtivo.nome}`);
    }
  }, [estudios]);

  const criarEstudio = async (nome: string, corPrimaria: CorPrimaria = "sky"): Promise<Estudio> => {
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const novoEstudio: Estudio = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      slug: slug || "estudio",
      corPrimaria,
      dataCriacao: new Date(),
      membros: [],
    };

    const atualizados = [...estudios, novoEstudio];
    salvarEstudiosNoStorage(atualizados);
    selecionarEstudio(novoEstudio.id);
    toast.success(`Estúdio "${novoEstudio.nome}" criado com sucesso!`);
    return novoEstudio;
  };

  const removerEstudio = async (id: string) => {
    if (estudios.length <= 1) {
      toast.error("Não é possível remover o único estúdio existente.");
      return;
    }

    const restantes = estudios.filter((e) => e.id !== id);
    salvarEstudiosNoStorage(restantes);

    if (estudioAtivo?.id === id) {
      selecionarEstudio(restantes[0].id);
    }
    toast.success("Estúdio removido com sucesso.");
  };

  const adicionarMembro = async (estudioId: string, email: string, papel: "OPERADOR" | "ADMIN" = "OPERADOR") => {
    const atualizados = estudios.map((est) => {
      if (est.id !== estudioId) return est;
      const membrosExistentes = est.membros || [];
      if (membrosExistentes.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Este operador já foi adicionado ao estúdio.");
      }
      const novoMembro: MembroEstudio = {
        email: email.trim().toLowerCase(),
        papel,
        dataEntrada: new Date().toISOString(),
      };
      return {
        ...est,
        membros: [...membrosExistentes, novoMembro],
      };
    });

    salvarEstudiosNoStorage(atualizados);
    if (estudioAtivo?.id === estudioId) {
      const atualizado = atualizados.find((e) => e.id === estudioId);
      if (atualizado) definirEstudioAtivoInterno(atualizado);
    }
    toast.success(`Membro ${email} adicionado com sucesso.`);
  };

  const removerMembro = async (estudioId: string, email: string) => {
    const atualizados = estudios.map((est) => {
      if (est.id !== estudioId) return est;
      return {
        ...est,
        membros: (est.membros || []).filter((m) => m.email.toLowerCase() !== email.toLowerCase()),
      };
    });

    salvarEstudiosNoStorage(atualizados);
    if (estudioAtivo?.id === estudioId) {
      const atualizado = atualizados.find((e) => e.id === estudioId);
      if (atualizado) definirEstudioAtivoInterno(atualizado);
    }
    toast.success(`Membro ${email} removido do estúdio.`);
  };

  const valor = {
    estudioAtivo,
    estudios,
    definirEstudioAtivo: selecionarEstudio,
    criarEstudio,
    removerEstudio,
    adicionarMembro,
    removerMembro,
    carregando,
  };

  return <ContextoEstudio.Provider value={valor}>{children}</ContextoEstudio.Provider>;
}
