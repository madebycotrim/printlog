/**
 * @file armazemNotificacoes.ts
 * @description Store Zustand para gestão de notificações globais.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Notificacao } from "../tipos/notificacoes";
import { armazenamentoSeguro } from "@/compartilhado/utilitarios/armazenamento-seguro";

interface ArmazemNotificacoesState {
  notificacoes: Notificacao[];

  // Ações
  adicionarNotificacao: (notificacao: Omit<Notificacao, "id" | "data" | "lida">) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  limparNotificacoes: () => void;
  removerNotificacao: (id: string) => void;
}

export const useArmazemNotificacoes = create<ArmazemNotificacoesState>()(
  devtools(
    persist(
      (set) => ({
        notificacoes: [],

        adicionarNotificacao: (dados) =>
          set(
            (estado) => {
              const nova: Notificacao = {
                ...dados,
                id: crypto.randomUUID(),
                data: new Date(),
                lida: false,
              };
              // Mantém apenas as últimas 50 notificações para evitar inchaço do localStorage
              const listaAtualizada = [nova, ...estado.notificacoes].slice(0, 50);
              return { notificacoes: listaAtualizada };
            },
            false,
            "notificacoes/adicionarNotificacao",
          ),

        marcarComoLida: (id) =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)),
            }),
            false,
            "notificacoes/marcarComoLida",
          ),

        marcarTodasComoLidas: () =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.map((n) => ({ ...n, lida: true })),
            }),
            false,
            "notificacoes/marcarTodasComoLidas",
          ),

        limparNotificacoes: () => set({ notificacoes: [] }, false, "notificacoes/limpar"),

        removerNotificacao: (id) =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.filter((n) => n.id !== id),
            }),
            false,
            "notificacoes/removerNotificacao",
          ),
      }),
      {
        name: "printlog:notificacoes",
        // Necessário para serializar o Date corretamente
        storage: {
          getItem: (name) => {
            const data = armazenamentoSeguro.obter<any>(name, null);
            if (!data || !data.state) return null;
            data.state.notificacoes = data.state.notificacoes.map((n: any) => ({
              ...n,
              data: new Date(n.data),
            }));
            return data;
          },
          setItem: (name, value) => armazenamentoSeguro.definir(name, value),
          removeItem: (name) => armazenamentoSeguro.remover(name),
        },
      },
    ),
    { name: "ArmazemNotificacoes" },
  ),
);
