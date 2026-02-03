import axios from 'axios';
import { useToastStore } from '../stores/toastStore';

const api = axios.create({
    baseURL: '/api',
});

// Interceptor para adicionar token
export const configurarInterceptadoresAxios = (getToken) => {
    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    }, error => Promise.reject(error));

    // Interceptor para tratar erros globais
    api.interceptors.response.use(response => response, error => {
        if (error.response && error.response.status === 409) {
            // Conflito de versão (Optimistic Locking)
            const addToast = useToastStore.getState().addToast;
            addToast?.("Dados desatualizados. Recarregando...", "error");

            // Opcional: Recarregar página ou invalidar cache SWR globalmente
            // window.location.reload(); 
        }
        return Promise.reject(error);
    });
};

export default api;
