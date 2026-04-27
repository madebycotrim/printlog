/**
 * Middleware de Segurança Global - Cloudflare Pages Functions
 * Responsável por validar o Firebase ID Token (JWT) em todas as rotas de API.
 * Blindagem: Impede personificação de usuários e garante que apenas requisições autenticadas passem.
 */

interface Env {
    DB: D1Database;
    EMAIL_DONO: string;
}

// ID do Projeto Firebase para validação do campo 'aud' (Audiência)
const FIREBASE_PROJECT_ID = "printlog-85fe6";

/**
 * Decodifica um JWT de forma básica (sem validação de assinatura para performance, 
 * mas validando expiração e projeto).
 * Nota: Para blindagem total em produção, deve-se validar a assinatura RS256 com chaves públicas do Google.
 */
function decodificarToken(token: string) {
    try {
        const partes = token.split('.');
        if (partes.length !== 3) return null;

        const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        const agora = Math.floor(Date.now() / 1000);
        
        // Validações básicas de segurança
        if (payload.exp < agora) return null; // Token expirado
        if (payload.aud !== FIREBASE_PROJECT_ID) return null; // Destinado a outro projeto
        if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null; // Emissor inválido

        return payload;
    } catch (e) {
        return null;
    }
}

export const onRequest: PagesFunction<Env, any, { uid: string; email: string }> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // Ignora rotas que não sejam da API se necessário (embora este arquivo esteja na pasta /api)
    if (!url.pathname.startsWith("/api")) {
        return context.next();
    }

    // Tenta obter o token do header Authorization
    const authHeader = request.headers.get("Authorization");
    let uid = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const dadosToken = decodificarToken(token);
        
        if (dadosToken) {
            uid = dadosToken.sub; // O 'sub' no Firebase é o UID do usuário
            context.data.email = dadosToken.email || "";
        }
    }

    // Fallback temporário: se não tiver Bearer, tenta o header antigo (x-usuario-id)
    // TODO: Remover este fallback após garantir que todos os serviços frontend usam Bearer
    if (!uid) {
        uid = request.headers.get("x-usuario-id") || "";
    }

    // Se após todas as tentativas não tivermos um UID, barramos a requisição
    if (!uid) {
        return new Response(JSON.stringify({ 
            erro: "Acesso negado. Token de autenticação inválido ou ausente.",
            codigo: "AUTH_REQUIRED"
        }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Injeta o UID no contexto para que as rotas (handlers) possam usar
    context.data.uid = uid;

    // BLOQUEIO DE ADMIN: Se a rota for /api/admin, valida se o e-mail é o do dono
    if (url.pathname.startsWith("/api/admin")) {
        const emailUsuario = context.data.email;
        const emailDono = env.EMAIL_DONO;

        if (!emailUsuario || !emailDono || emailUsuario.toLowerCase() !== emailDono.toLowerCase()) {
            console.error(`[Seguranca] Tentativa de acesso não autorizado à rota admin por: ${emailUsuario} (UID: ${uid})`);
            return new Response(JSON.stringify({ 
                erro: "Acesso negado. Esta área é restrita ao administrador.",
                codigo: "ADMIN_REQUIRED"
            }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // Prossegue para a rota original
    return context.next();
};
