import React from "react";
import { DollarSign, Landmark, ShieldAlert, Tag } from "lucide-react";
import { UnifiedInput } from "../../../../components/formInputs";

// DEFINIÇÕES TÉCNICAS DOS INPUTS DESTE CARD
const CONFIG = {
  lucro: {
    label: "Lucro Desejado",
    icon: DollarSign,
    suffix: "%",
    isLucro: true, // Ativa o tema azul centralizado
    type: "number",
    step: "0.1",
    placeholder: "0"
  },
  imposto: {
    label: "Impostos",
    icon: Landmark,
    suffix: "%",
    type: "number",
    step: "0.1",
    placeholder: "0"
  },
  falha: {
    label: "Reserva para Falhas",
    icon: ShieldAlert,
    suffix: "%",
    type: "number",
    step: "0.1",
    placeholder: "0"
  },
  desconto: {
    label: "Margem de Desconto",
    icon: Tag,
    suffix: "%",
    type: "number",
    step: "0.1",
    placeholder: "0"
  }
};

export default function Precificacao({
  margemLucro,
  setMargemLucro,
  imposto,
  setImposto,
  taxaFalha,
  setTaxaFalha,
  desconto,
  setDesconto
}) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Campo de Lucro (Destaque Azul via isLucro) */}
      <UnifiedInput
        {...CONFIG.lucro}
        value={margemLucro}
        onChange={(e) => setMargemLucro(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      {/* Outros campos (Visual Padrão Cinza) */}
      <UnifiedInput
        {...CONFIG.imposto}
        value={imposto}
        onChange={(e) => setImposto(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <UnifiedInput
        {...CONFIG.falha}
        value={taxaFalha}
        onChange={(e) => setTaxaFalha(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <UnifiedInput
        {...CONFIG.desconto}
        value={desconto}
        onChange={(e) => setDesconto(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

    </div>
  );
}