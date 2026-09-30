interface PropriedadesBandeira {
  className?: string;
}

/**
 * 🇧🇷 Bandeira do Brasil em SVG vetorial de alta definição
 */
export function BandeiraBrasil({ className = "w-4 h-3" }: PropriedadesBandeira) {
  return (
    <svg
      viewBox="0 0 32 22"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandeira do Brasil"
    >
      <rect width="32" height="22" rx="2" fill="#009B3A" />
      <polygon points="16,3 29,11 16,19 3,11" fill="#FEDF00" />
      <circle cx="16" cy="11" r="4.6" fill="#002776" />
      <path
        d="M12.2 12.8C13.5 10.8 16 10.2 19.8 11.2"
        stroke="#FFFFFF"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * 🇺🇸 Bandeira dos Estados Unidos em SVG vetorial de alta definição
 */
export function BandeiraEUA({ className = "w-4 h-3" }: PropriedadesBandeira) {
  return (
    <svg
      viewBox="0 0 32 22"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandeira dos Estados Unidos"
    >
      <clipPath id="canto-eua">
        <rect width="32" height="22" rx="2" />
      </clipPath>
      <g clipPath="url(#canto-eua)">
        {/* Fundo Branco */}
        <rect width="32" height="22" fill="#FFFFFF" />
        {/* 7 Faixas Vermelhas */}
        <rect y="0" width="32" height="1.69" fill="#B22234" />
        <rect y="3.38" width="32" height="1.69" fill="#B22234" />
        <rect y="6.77" width="32" height="1.69" fill="#B22234" />
        <rect y="10.15" width="32" height="1.69" fill="#B22234" />
        <rect y="13.54" width="32" height="1.69" fill="#B22234" />
        <rect y="16.92" width="32" height="1.69" fill="#B22234" />
        <rect y="20.31" width="32" height="1.69" fill="#B22234" />
        {/* Cantão Azul */}
        <rect width="14" height="11.85" fill="#3C3B6E" />
        {/* Estrelas representadas em padrão vetorial */}
        <g fill="#FFFFFF">
          <circle cx="2.5" cy="2" r="0.7" />
          <circle cx="5.8" cy="2" r="0.7" />
          <circle cx="9.1" cy="2" r="0.7" />
          <circle cx="12.4" cy="2" r="0.7" />
          <circle cx="4.15" cy="4" r="0.7" />
          <circle cx="7.45" cy="4" r="0.7" />
          <circle cx="10.75" cy="4" r="0.7" />
          <circle cx="2.5" cy="6" r="0.7" />
          <circle cx="5.8" cy="6" r="0.7" />
          <circle cx="9.1" cy="6" r="0.7" />
          <circle cx="12.4" cy="6" r="0.7" />
          <circle cx="4.15" cy="8" r="0.7" />
          <circle cx="7.45" cy="8" r="0.7" />
          <circle cx="10.75" cy="8" r="0.7" />
          <circle cx="2.5" cy="10" r="0.7" />
          <circle cx="5.8" cy="10" r="0.7" />
          <circle cx="9.1" cy="10" r="0.7" />
          <circle cx="12.4" cy="10" r="0.7" />
        </g>
      </g>
    </svg>
  );
}

/**
 * 🇪🇸 Bandeira da Espanha em SVG vetorial de alta definição
 */
export function BandeiraEspanha({ className = "w-4 h-3" }: PropriedadesBandeira) {
  return (
    <svg
      viewBox="0 0 32 22"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandeira da Espanha"
    >
      <clipPath id="canto-es">
        <rect width="32" height="22" rx="2" />
      </clipPath>
      <g clipPath="url(#canto-es)">
        {/* Faixa Vermelha Superior */}
        <rect width="32" height="5.5" fill="#C60B1E" />
        {/* Faixa Amarela Central (dobro da altura) */}
        <rect y="5.5" width="32" height="11" fill="#FFC400" />
        {/* Faixa Vermelha Inferior */}
        <rect y="16.5" width="32" height="5.5" fill="#C60B1E" />
        {/* Brasão Espanhol Estilizado */}
        <g transform="translate(6.5, 7.5)">
          <rect x="0" y="2" width="4.5" height="5" rx="0.5" fill="#C60B1E" />
          <rect x="0.8" y="2.8" width="2.9" height="3.4" fill="#FFC400" />
          <path d="M0.3 1.5C0.3 0.6 2.25 0 2.25 0C2.25 0 4.2 0.6 4.2 1.5H0.3Z" fill="#C60B1E" />
          <circle cx="2.25" cy="0.4" r="0.4" fill="#FFC400" />
          <rect x="-1" y="2" width="0.6" height="5" fill="#FFFFFF" />
          <rect x="4.9" y="2" width="0.6" height="5" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}

interface PropriedadesBandeiraPais {
  codigo: string;
  className?: string;
}

/**
 * Renderizador inteligente de bandeira por código de idioma (ex: 'pt-BR', 'en-US', 'es-ES')
 */
export function BandeiraPais({
  codigo,
  className = "w-4 h-3 rounded-[2px] shadow-xs shrink-0 inline-block overflow-hidden",
}: PropriedadesBandeiraPais) {
  const norm = (codigo || "").toLowerCase();

  if (norm.includes("br") || norm === "pt") {
    return <BandeiraBrasil className={className} />;
  }
  if (norm.includes("us") || norm.includes("en")) {
    return <BandeiraEUA className={className} />;
  }
  if (norm.includes("es")) {
    return <BandeiraEspanha className={className} />;
  }

  return null;
}
