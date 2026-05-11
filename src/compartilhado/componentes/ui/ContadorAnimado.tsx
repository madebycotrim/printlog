import { useState, useEffect } from "react";

interface ContadorAnimadoProps {
  valor: number;
  prefixo?: string;
  sufixo?: string;
  casasDecimais?: number;
  className?: string;
}

/**
 * Componente para animar a transição de números (Efeito Banco/Odometer).
 * @param valor - O valor numérico final para o qual o contador deve ir.
 * @param prefixo - Texto opcional antes do número (ex: "R$ ").
 * @param sufixo - Texto opcional depois do número (ex: "g", "%").
 * @param casasDecimais - Quantidade de casas decimais (padrão: 2).
 * @param className - Classes CSS opcionais.
 */
export const ContadorAnimado = ({ 
  valor, 
  prefixo = "R$ ", 
  sufixo = "",
  casasDecimais = 2,
  className = "" 
}: ContadorAnimadoProps) => {
  const [exibido, setExibido] = useState(valor);

  useEffect(() => {
    let frame: number;
    const duracao = 500; // ms
    const inicio = Date.now();
    const valorInicial = exibido;

    const animar = () => {
      const tempoDecorrido = Date.now() - inicio;
      const progresso = Math.min(tempoDecorrido / duracao, 1);
      
      // Easing suave (out-expo)
      const easeOutExpo = 1 - Math.pow(2, -10 * progresso);
      const valorAtual = valorInicial + (valor - valorInicial) * easeOutExpo;
      
      setExibido(valorAtual);

      if (progresso < 1) {
        frame = requestAnimationFrame(animar);
      } else {
        setExibido(valor); // Garante que termine no valor exato
      }
    };

    frame = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(frame);
  }, [valor]);

  return (
    <span className={className}>
      {prefixo}
      {exibido.toLocaleString('pt-BR', { 
        minimumFractionDigits: casasDecimais, 
        maximumFractionDigits: casasDecimais 
      })}
      {sufixo}
    </span>
  );
};
