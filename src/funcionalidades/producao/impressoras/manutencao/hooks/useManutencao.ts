import { useState, useEffect, useCallback } from "react";
import { RegistroManutencao, PecaDesgaste, RegistrarManutencaoInput } from "../../tipos";
import { servicoManutencao } from "@/compartilhado/servicos/servicoManutencao";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { toast } from "sonner";

export function useManutencao(idImpressora?: string) {
  const [manutencoes, setManutencoes] = useState<RegistroManutencao[]>([]);
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
    const id = dados.id || crypto.randomUUID();
    const impressora = useArmazemImpressoras.getState().impressoras.find(i => i.id === dados.idImpressora);
    const horasMaquina = impressora?.horimetroTotalMinutos || 0;

    const novaManutencaoOtimista: RegistroManutencao = {
      id,
      idImpressora: dados.idImpressora,
      tipo: dados.tipo,
      descricao: dados.descricao,
      custoCentavos: dados.custoCentavos || 0,
      data: new Date().toISOString(),
      horasMaquinaNoMomentoMinutos: horasMaquina,
      pecasTrocadas: dados.pecasTrocadas?.join(", ") || "",
      responsavel: "Usuário",
      tempoParadaMinutos: dados.tempoParadaMinutos || 0,
    };

    // ⚡️ OTIMISTA
    setManutencoes(prev => [novaManutencaoOtimista, ...prev]);

    try {
      const nova = await servicoManutencao.registrarManutencao({ ...dados, id });
      // Substitui o registro otimista pelo real retornado da API
      setManutencoes(prev => prev.map(m => m.id === id ? nova : m));
      toast.success("Manutenção registrada com sucesso!");
      return nova;
    } catch (erro) {
      // 🔙 ROLLBACK
      setManutencoes(prev => prev.filter(m => m.id !== id));
      toast.error("Erro ao registrar manutenção. Alteração revertida.");
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
