import { useState, useEffect, useCallback } from "react";
import { Manutencao, PecaDesgaste, RegistrarManutencaoInput } from "../tipos";
import { servicoManutencao } from "../servicos/servicoManutencao";
import { toast } from "react-hot-toast";

export function usarManutencao(idImpressora?: string) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [pecas, setPecas] = useState<PecaDesgaste[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!idImpressora) return;
    try {
      setCarregando(true);
      const [dadosManutencao, dadosPecas] = await Promise.all([
        servicoManutencao.buscarManutencoes(idImpressora),
        servicoManutencao.buscarPecas(idImpressora),
      ]);
      setManutencoes(dadosManutencao);
      setPecas(dadosPecas);
    } catch (erro) {
      toast.error("Erro ao carregar dados de manutenção.");
    } finally {
      setCarregando(false);
    }
  }, [idImpressora]);

  const registrarManutencao = async (dados: RegistrarManutencaoInput) => {
    try {
      const nova = await servicoManutencao.registrarManutencao(dados);
      toast.success("Manutenção registrada com sucesso!");
      await carregarDados();
      return nova;
    } catch (erro) {
      toast.error("Erro ao registrar manutenção.");
      throw erro;
    }
  };

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    manutencoes,
    pecas,
    carregando,
    registrarManutencao,
    recarregar: carregarDados,
  };
}
