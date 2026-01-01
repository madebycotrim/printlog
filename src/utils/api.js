import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const setupAxiosInterceptors = (getToken) => {
    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    }, error => Promise.reject(error));
};

export default api;