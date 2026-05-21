/**
 * Resolve a URL da imagem para a impressora.
 * Se houver uma URL customizada já informada, retorna ela.
 * Caso contrário, tenta gerar dinamicamente a URL da CDN da SimplyPrint com base na marca e modelo.
 *
 * @param imagemUrl - URL de imagem customizada definida pelo usuário (opcional)
 * @param marca - Marca da impressora (ex: "Creality")
 * @param modelo - Modelo da impressora (ex: "Ender-3 V2")
 * @returns A URL final da imagem ou string vazia se não for possível gerar
 */
export function obterImagemImpressora(imagemUrl?: string | null, marca?: string, modelo?: string): string {
  if (imagemUrl && imagemUrl.trim() !== "") {
    return imagemUrl;
  }

  if (!marca || !modelo) {
    return "";
  }

  // Função interna para normalizar as strings conforme o padrão de pastas do CDN da SimplyPrint
  const normalizar = (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim()
      .replace(/[-\s]+/g, "_")         // Substitui espaços e hífens por sublinhado
      .replace(/[^a-z0-9_]/g, "");     // Limpa caracteres que não sejam letras, números ou sublinhados
  };

  let marcaPasta = normalizar(marca);
  const modeloPasta = normalizar(modelo);

  // Casos especiais conhecidos da CDN do SimplyPrint
  if (marcaPasta === "artillery") {
    marcaPasta = "artillery_3d";
  }

  return `https://cdn.simplyprint.io/i/printer_types/${marcaPasta}/${modeloPasta}/product_photo_md.png`;
}
