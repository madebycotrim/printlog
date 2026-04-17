import { HTMLAttributes, useState, useEffect } from "react";
import { gerarIniciais, gerarCorPorNome } from "@/compartilhado/utilitarios/avatar";

interface PropriedadesAvatar extends HTMLAttributes<HTMLDivElement> {
  /** Nome do usuário para gerar iniciais e cor */
  nome?: string | null;
  /** URL da foto opcional */
  fotoUrl?: string | null;
  /** Tamanho do avatar (ex: "w-9 h-9") */
  tamanho?: string;
  /** Se deve ser arredondado ou levemente arredondado */
  variante?: "circular" | "quadrado";
}

/**
 * Componente de Avatar que exibe a foto do usuário ou suas iniciais
 * com uma cor de fundo determinística baseada no nome.
 */
export function Avatar({
  nome,
  fotoUrl,
  tamanho = "h-9 w-9",
  variante = "quadrado",
  className = "",
  style,
  ...outrasPropriedades
}: PropriedadesAvatar) {
  const [imagemFalhou, definirImagemFalhou] = useState(false);
  
  // Reinicia o estado de erro se a fotoUrl mudar
  useEffect(() => {
    definirImagemFalhou(false);
  }, [fotoUrl]);

  const iniciais = gerarIniciais(nome);
  const corFundo = gerarCorPorNome(nome);
  
  // Forçamos o rounded-2xl para o visual de "quadrado arredondado" premium
  const arredondamento = variante === "circular" ? "rounded-full" : "rounded-xl";

  const mostrarIniciais = !fotoUrl || imagemFalhou;

  return (
    <div
      className={`${tamanho} ${arredondamento} flex items-center justify-center text-base font-black shrink-0 relative overflow-hidden border border-black/5 dark:border-white/5 ${className}`}
      style={{
        backgroundColor: mostrarIniciais ? corFundo : "transparent",
        color: "white",
        ...style,
      }}
      {...outrasPropriedades}
    >
      {fotoUrl && !imagemFalhou ? (
        <img
          src={fotoUrl}
          alt={nome || "Avatar"}
          className={`h-full w-full object-cover ${arredondamento}`}
          onError={() => definirImagemFalhou(true)}
        />
      ) : (
        <span className="select-none tracking-tight">{iniciais}</span>
      )}
      
      {/* Overlay de Brilho para estética premium */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
