/**
 * E-mail do dono da plataforma, definido nas variáveis de ambiente da Cloudflare (VITE_EMAIL_DONO).
 */
export const EMAIL_DONO = import.meta.env.VITE_EMAIL_DONO || "mateus.cotrim@gmail.com";

/**
 * Verifica se um e-mail pertence ao dono (administrador principal).
 */
export const ehAdmin = (email?: string | null) => {
  if (!email) return false;
  
  const dono = EMAIL_DONO.toLowerCase();
  const atual = email.toLowerCase();
  
  // Log de depuração (Remover após confirmar funcionamento)
  if (atual.includes("mateus") || atual.includes("cotrim") || atual.includes("admin")) {
    console.log("[Admin Check]", { 
      configurado: dono, 
      usuarioLogado: atual, 
      match: dono === atual 
    });
  }

  return atual === dono;
};
