import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.ts";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Queue of requests that arrived while a token refresh was already in flight.
let refreshing = false;
let queue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
    queue.forEach(({ resolve, reject }) => {
        if (token) resolve(token);
        else reject(error);
    });
    queue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Only handle 401s, and don't retry a request that already triggered a refresh.
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        // If a refresh is already in flight, queue this request until it resolves.
        if (refreshing) {
            return new Promise<string>((resolve, reject) => {
                queue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }

        original._retry = true;
        refreshing = true;

        const storedRefresh = localStorage.getItem(REFRESH_TOKEN);

        if (!storedRefresh) {
            refreshing = false;
            localStorage.clear();
            window.location.replace("/login");
            return Promise.reject(error);
        }

        try {
            // Use a raw axios call so this request doesn't pass through our interceptors.
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}api/token/refresh/`,
                { refresh: storedRefresh }
            );
            localStorage.setItem(ACCESS_TOKEN, data.access);
            processQueue(null, data.access);
            original.headers.Authorization = `Bearer ${data.access}`;
            return api(original);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.clear();
            window.location.replace("/login");
            return Promise.reject(refreshError);
        } finally {
            refreshing = false;
        }
    }
);

export default api;
