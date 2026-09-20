/**
 * E-mail do dono da plataforma, definido nas variáveis de ambiente da Cloudflare (VITE_EMAIL_DONO).
 */
export const EMAIL_DONO = (import.meta.env.VITE_EMAIL_DONO || "").trim();

/**
 * Verifica se um e-mail pertence ao dono (administrador principal).
 */
export const ehAdmin = (email?: string | null) => {
  if (!email || !EMAIL_DONO) return false;
  
  const dono = EMAIL_DONO.toLowerCase().trim();
  const atual = email.toLowerCase().trim();
  
  return atual === dono;
};
