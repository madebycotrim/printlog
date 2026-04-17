/**
 * Gera as iniciais a partir de um nome completo.
 * Ex: "Mateus Cotrim" -> "MC"
 * @param nome - Nome completo do usuário
 * @returns Iniciais em maiúsculo (máximo 2 caracteres)
 */
export const gerarIniciais = (nome?: string | null): string => {
  if (!nome || nome.trim() === "") return "?";
  
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  
  const primeiraInicial = partes[0].charAt(0);
  const ultimaInicial = partes[partes.length - 1].charAt(0);
  
  return (primeiraInicial + ultimaInicial).toUpperCase();
};

/**
 * Gera uma cor hexadecimal determinística baseada no nome.
 * Utiliza um hash simples para garantir que o mesmo nome sempre tenha a mesma cor.
 * @param nome - Nome do usuário
 * @returns Cor em formato HSL (mais fácil de garantir legibilidade)
 */
export const gerarCorPorNome = (nome?: string | null): string => {
  if (!nome || nome.trim() === "") return "hsl(215, 25%, 27%)"; // Zinc 700ish para vazio

  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    // Multiplicador 31 é comum em hashes de strings para espalhar melhor os valores
    hash = (hash << 5) - hash + nome.charCodeAt(i);
    hash |= 0; // Converte para inteiro de 32 bits
  }

  // Pegamos o valor absoluto para a matiz
  // Usamos um multiplicador para que pequenas mudanças no nome (ex: "Cotrim" -> "Cotrins")
  // resultem em mudanças maiores na cor.
  const h = Math.abs(hash * 13) % 360;
  
  // Saturação entre 50% e 75%
  const s = 50 + (Math.abs(hash % 25));
  
  // Luminosidade entre 40% e 50% (garante contraste com texto branco)
  const l = 40 + (Math.abs(hash % 10));

  return `hsl(${h}, ${s}%, ${l}%)`;
};
