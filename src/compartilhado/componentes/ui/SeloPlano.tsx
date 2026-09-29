import { BadgeMaker } from "./BadgeMaker";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

interface PropriedadesSeloPlano {
  plano?: PlanoUsuario;
  exibirSempre?: boolean;
  tamanho?: "pequeno" | "normal";
  className?: string;
}

/**
 * SeloPlano - Agora integrado com o sistema de Badges e Medalhas Maker.
 * Redireciona para o BadgeMaker que exibe as conquistas acumuladas do usuário.
 */
export function SeloPlano({
  tamanho = "normal",
  className = "",
}: PropriedadesSeloPlano) {
  return (
    <BadgeMaker
      tamanho={tamanho}
      className={className}
      exibirContagem={true}
    />
  );
}
