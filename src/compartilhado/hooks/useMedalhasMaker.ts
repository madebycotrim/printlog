import { useMemo } from "react";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { useArmazemClientes } from "@/funcionalidades/comercial/clientes/estado/armazemClientes";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useArmazemCalculadora } from "@/funcionalidades/geral/calculadora/estado/armazemCalculadora";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import {
  calcularMedalhas,
  obterTituloNivelMaker,
  MedalhaProcessada,
  DadosEstatisticasMaker,
} from "@/compartilhado/utilitarios/medalhasMaker";

export function useMedalhasMaker() {
  const materiais = useArmazemMateriais((s) => s.materiais);
  const impressoras = useArmazemImpressoras((s) => s.impressoras);
  const insumos = useArmazemInsumos((s) => s.insumos);
  const clientes = useArmazemClientes((s) => s.clientes);
  const historicoCalculos = useArmazemCalculadora((s) => s.historico);
  const { pedidos } = usePedidos();

  const nomeEstudio = useArmazemConfiguracoes((s) => s.nomeEstudio);
  const logoEstudio = useArmazemConfiguracoes((s) => s.logoEstudio);
  const sloganEstudio = useArmazemConfiguracoes((s) => s.sloganEstudio);
  const custoEnergia = useArmazemConfiguracoes((s) => s.custoEnergia);
  const horaMaquina = useArmazemConfiguracoes((s) => s.horaMaquina);

  const dadosEstatisticas = useMemo<DadosEstatisticasMaker>(() => {
    return {
      totalMateriais: materiais?.length || 0,
      totalImpressoras: impressoras?.length || 0,
      totalInsumos: insumos?.length || 0,
      totalClientes: clientes?.length || 0,
      totalOrcamentos: Math.max(historicoCalculos?.length || 0, pedidos?.length || 0),
      temEstudioConfigurado: Boolean(
        (nomeEstudio && nomeEstudio.trim().length > 0) ||
        (logoEstudio && logoEstudio.trim().length > 0) ||
        (sloganEstudio && sloganEstudio.trim().length > 0)
      ),
      temCustosConfigurados: Boolean(
        (typeof custoEnergia === "number" && custoEnergia > 0) ||
        (typeof horaMaquina === "number" && horaMaquina > 0)
      ),
    };
  }, [
    materiais,
    impressoras,
    insumos,
    clientes,
    historicoCalculos,
    pedidos,
    nomeEstudio,
    logoEstudio,
    sloganEstudio,
    custoEnergia,
    horaMaquina,
  ]);

  const medalhas = useMemo(() => {
    return calcularMedalhas(dadosEstatisticas);
  }, [dadosEstatisticas]);

  const medalhasDesbloqueadas = useMemo(() => {
    return medalhas.filter((m) => m.desbloqueada);
  }, [medalhas]);

  const medalhasBloqueadas = useMemo(() => {
    return medalhas.filter((m) => !m.desbloqueada);
  }, [medalhas]);

  const totalConquistadas = medalhasDesbloqueadas.length;
  const totalMedalhas = medalhas.length;

  const nivelMaker = useMemo(() => {
    return obterTituloNivelMaker(totalConquistadas);
  }, [totalConquistadas]);

  // Medalha de maior destaque (prioriza Lendária > Ouro > Prata > Bronze)
  const medalhaDestaque = useMemo<MedalhaProcessada>(() => {
    const ordem = { lendaria: 4, ouro: 3, prata: 2, bronze: 1 };
    const ordenadas = [...medalhasDesbloqueadas].sort(
      (a, b) => (ordem[b.nivel] || 0) - (ordem[a.nivel] || 0)
    );
    return ordenadas[0] || medalhas[0];
  }, [medalhasDesbloqueadas, medalhas]);

  // Próxima medalha a ser conquistada (com maior progresso percentual)
  const proximaMedalha = useMemo<MedalhaProcessada | null>(() => {
    if (medalhasBloqueadas.length === 0) return null;
    return [...medalhasBloqueadas].sort((a, b) => b.progresso - a.progresso)[0];
  }, [medalhasBloqueadas]);

  return {
    medalhas,
    medalhasDesbloqueadas,
    medalhasBloqueadas,
    totalConquistadas,
    totalMedalhas,
    nivelMaker,
    medalhaDestaque,
    proximaMedalha,
    estatisticas: dadosEstatisticas,
  };
}
