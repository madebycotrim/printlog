import { HTMLAttributes, useState } from "react";
import { gerarIniciais, gerarCorPorNome } from "@/compartilhado/utilitarios/avatar";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

interface PropriedadesAvatar extends HTMLAttributes<HTMLDivElement> {
  /** Nome do usuário para gerar iniciais e cor */
  nome?: string | null;
  /** URL da foto opcional */
  fotoUrl?: string | null;
  /** Tamanho do avatar (ex: "w-9 h-9") */
  tamanho?: string;
  /** Se deve ser arredondado ou levemente arredondado */
  variante?: "circular" | "quadrado";
  /** @deprecated Use 'plano' em vez disso. Se o usuário é PRO para ativar efeitos de elite */
  pro?: boolean;
  /** Plano do usuário para efeitos visuais específicos */
  plano?: PlanoUsuario;
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
  pro: _pro = false,
  plano: _plano,
  className = "",
  style,
  ...outrasPropriedades
}: PropriedadesAvatar) {
  const [prevFotoUrl, definirPrevFotoUrl] = useState(fotoUrl);
  const [imagemFalhou, definirImagemFalhou] = useState(false);

  if (fotoUrl !== prevFotoUrl) {
    definirPrevFotoUrl(fotoUrl);
    definirImagemFalhou(false);
  }

  const iniciais = gerarIniciais(nome);
  const corFundo = gerarCorPorNome(nome);
  
  // Forçamos o rounded-2xl para o visual de "quadrado arredondado" premium
  const arredondamento = variante === "circular" ? "rounded-full" : "rounded-xl";

  const mostrarIniciais = !fotoUrl || imagemFalhou;

  const efeitoElite = () => {
    // Efeito de anel removido conforme solicitado
    return "";
  };

  return (
    <div
      className={`${tamanho} ${arredondamento} flex items-center justify-center text-xl font-bold shrink-0 relative overflow-hidden border-none ring-0 shadow-none ${efeitoElite()} ${className}`}
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
      
      {/* Overlay de Brilho removido */}
    </div>
  );
}
