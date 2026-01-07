import axios from 'axios';

/**
 * Criação da instância central do Axios.
 * O uso de VITE_API_URL permite que você altere o endereço do back-end 
 * sem mexer no código, apenas no arquivo .env.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 segundos para evitar requisições penduradas em redes instáveis
});

/**
 * Configuração dos Interceptores.
 * @param {Function} getToken - Função do Clerk para obter o JWT.
 * @param {Function} signOut - (Opcional) Função do Clerk para deslogar em caso de erro 401.
 */
export const setupAxiosInterceptors = (getToken, signOut) => {
    
    // 1. INTERCEPTOR DE REQUISIÇÃO (Injeção do Token)
    api.interceptors.request.use(async (config) => {
        try {
            // Buscamos o token em tempo real. O Clerk cuida do refresh automático.
            const token = await getToken();
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Falha ao injetar protocolo de segurança:", error);
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    // 2. INTERCEPTOR DE RESPOSTA (Tratamento Global de Erros)
    api.interceptors.response.use(
        (response) => {
            // Retornamos apenas o .data para facilitar o uso nos componentes
            // Ex: const data = await api.get('/perfil') em vez de res.data.data
            return response.data; 
        },
        async (error) => {
            const status = error.response?.status;

            // ERRO 401: Token inválido, expirado ou revogado no Dashboard do Clerk
            if (status === 401) {
                console.warn("⚠️ Sessão expirada ou acesso não autorizado.");
                
                if (signOut) {
                    // Se o back-end rejeitar o token, limpamos a sessão no front
                    await signOut();
                    window.location.href = '/login';
                }
            }

            // ERRO 403: Proibido (Usuário logado, mas sem permissão)
            if (status === 403) {
                console.error("❌ Ação proibida: Você não tem permissão para este recurso.");
            }

            // ERRO 500: Erro interno no Worker/D1
            if (status >= 500) {
                console.error("🔥 Erro crítico no servidor remoto.");
            }

            return Promise.reject(error);
        }
    );
};

export default api;