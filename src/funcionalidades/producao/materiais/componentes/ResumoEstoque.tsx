import { PackageSearch, DollarSign, AlertTriangle, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { GraficoConsumoMateriais } from "./GraficoConsumoMateriais";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

import { motion } from "framer-motion";

import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { ModalPatrimonio } from "@/funcionalidades/geral/painel/componentes/ModalPatrimonio";

interface PropriedadesResumoEstoque {
  materiais: Material[];
  insumos: Insumo[];
  totalEmbalagens: number;
  valorInvestido: number;
  alertasBaixoEstoque: number;
}

/**
 * Painel de resumo de estoque com métricas de patrimônio e alertas críticos.
 */
export function ResumoEstoque({
  materiais,
  insumos,
  totalEmbalagens,
  valorInvestido,
  alertasBaixoEstoque,
}: PropriedadesResumoEstoque) {
  const [modalGraficoAberto, definirModalGraficoAberto] = useState(false);
  const [modalPatrimonioAberto, definirModalPatrimonioAberto] = useState(false);

  const previsaoResumo = useMemo(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const registros30d = materiais.flatMap((m) => 
      (m.historicoUso || []).map(r => ({ ...r, dataReal: new Date(Number(r.id)) }))
    ).filter(r => r.dataReal >= trintaDiasAtras);

    let totalGasto = registros30d.reduce((acc, curr) => acc + curr.quantidadeGastaGramas, 0);
    let diasParaMedia = 30;

    // Fallback: Se não há consumo nos últimos 30 dias, olhamos o histórico total
    if (totalGasto === 0) {
      const todosRegistros = materiais.flatMap((m) => (m.historicoUso || []));
      if (todosRegistros.length === 0) return "Aguardando Uso";
      
      totalGasto = todosRegistros.reduce((acc, curr) => acc + curr.quantidadeGastaGramas, 0);
      // Estimamos os dias com base no primeiro registro
      const timestamps = todosRegistros.map(r => Number(r.id));
      const primeiroRegistro = Math.min(...timestamps);
      diasParaMedia = Math.max(1, (hoje.getTime() - primeiroRegistro) / (1000 * 60 * 60 * 24));
    }

    const mediaDiaria = totalGasto / diasParaMedia;
    if (mediaDiaria === 0) return "Aguardando Uso";

    const estoqueTotal = materiais.reduce((acc, m) => acc + m.pesoRestanteGramas + (m.estoque * m.pesoGramas), 0);
    const dias = Math.floor(estoqueTotal / mediaDiaria);

    if (dias > 365) return "+1 Ano";
    if (dias > 30) return `${Math.floor(dias / 30)} Meses`;
    return `${dias} Dias`;
  }, [materiais]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
    >
      <CardResumo titulo="Volume de Insumos" valor={totalEmbalagens} unidade="rolos / resinas" icone={PackageSearch} cor="sky" />

      <CardResumo
        titulo="Patrimônio em Estoque"
        valor={centavosParaReais(valorInvestido)}
        icone={DollarSign}
        cor="emerald"
        aoClicar={() => definirModalPatrimonioAberto(true)}
        textoAcao="Ver Detalhes"
      />

      <CardResumo
        titulo="Alertas Críticos"
        valor={alertasBaixoEstoque}
        unidade="materiais baixos"
        icone={AlertTriangle}
        cor={alertasBaixoEstoque > 0 ? "rose" : "zinc"}
      />

      <CardResumo
        titulo="Previsão de Uso"
        valor={previsaoResumo}
        unidade={previsaoResumo === "Aguardando Uso" ? "sem histórico" : "restantes"}
        icone={Activity}
        cor="indigo"
        aoClicar={() => definirModalGraficoAberto(true)}
        textoAcao="Ver Projetado"
      />

      <Dialogo
        aberto={modalGraficoAberto}
        aoFechar={() => definirModalGraficoAberto(false)}
        titulo="Projeção de Consumo de Materiais"
        larguraMax="max-w-5xl"
      >
        <div className="p-8">
          <GraficoConsumoMateriais materiais={materiais} />
        </div>
      </Dialogo>

      <ModalPatrimonio
        aberto={modalPatrimonioAberto}
        aoFechar={() => definirModalPatrimonioAberto(false)}
        materiais={materiais}
        insumos={insumos}
        tipoVista="materiais"
      />
    </motion.div>
  );
}
