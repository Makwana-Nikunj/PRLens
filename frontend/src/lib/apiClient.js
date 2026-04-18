import conf from '../conf/conf.js';
import axios from 'axios';

// Shared axios instance for all API calls
export const apiClient = axios.create({
    baseURL: conf.apiBaseUrl,
    withCredentials: true,
    timeout: 120000, 
});

// Track if a token refresh is already in progress
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed() {
    refreshSubscribers.forEach(cb => cb());
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
}

// Response interceptor — auto-retry on 401 with token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only intercept 401s, and don't retry refresh/login/register requests
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/register') &&
            !originalRequest.url?.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    await apiClient.post('/auth/refresh-token');
                    isRefreshing = false;
                    onTokenRefreshed();
                    // Retry the original request
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshSubscribers = [];
                    // Refresh failed — user needs to re-login
                    return Promise.reject(refreshError);
                }
            } else {
                // Another refresh is in progress — queue this request
                return new Promise((resolve) => {
                    addRefreshSubscriber(() => {
                        resolve(apiClient(originalRequest));
                    });
                });
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
