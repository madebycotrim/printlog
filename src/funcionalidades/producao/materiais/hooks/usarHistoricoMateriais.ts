import { useState, useEffect, useCallback } from "react";
import { RegistroUso } from "../tipos";
import { servicoUsoMateriais } from "../servicos/servicoUsoMateriais";
import { toast } from "react-hot-toast";

export function usarHistoricoMateriais(idMaterial?: string) {
  const [historico, setHistorico] = useState<RegistroUso[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarHistorico = useCallback(async () => {
    if (!idMaterial) return;
    try {
      setCarregando(true);
      const dados = await servicoUsoMateriais.buscarHistorico(idMaterial);
      setHistorico(dados);
    } catch (erro) {
      toast.error("Erro ao carregar histórico de uso.");
    } finally {
      setCarregando(false);
    }
  }, [idMaterial]);

  const registrarConsumo = async (dados: Omit<RegistroUso, "id" | "data">) => {
    try {
      const novo = await servicoUsoMateriais.registrarUso(idMaterial!, dados);
      toast.success("Consumo registrado!");
      await carregarHistorico();
      return novo;
    } catch (erro) {
      toast.error("Erro ao registrar consumo.");
      throw erro;
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return {
    historico,
    carregando,
    registrarConsumo,
    recarregar: carregarHistorico,
  };
}
