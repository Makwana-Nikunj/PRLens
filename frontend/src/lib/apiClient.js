import conf from '../conf/conf.js';
import axios from 'axios';

// Shared axios instance for all API calls
export const apiClient = axios.create({
    baseURL: conf.apiBaseUrl,
    withCredentials: true,
    timeout: 300000,
});

// Request interceptor — attach Bearer token if present in auth-storage (for cross-site cookie fallback)
apiClient.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.accessToken;
            if (token && !config.headers?.Authorization) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (_err) {}
    return config;
});

// Track if a token refresh is already in progress
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * When a token refresh completes, call all the queued callbacks to retry their requests.
 */
function onTokenRefreshed() {
    refreshSubscribers.forEach(cb => cb());
    refreshSubscribers = [];
}

/**
 * Add a callback to be called when the token refresh completes.
 */
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
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const refreshRes = await apiClient.post('/auth/refresh');
                    const newAccessToken = refreshRes.data?.data?.accessToken;
                    if (newAccessToken) {
                        try {
                            const raw = localStorage.getItem('auth-storage');
                            if (raw) {
                                const parsed = JSON.parse(raw);
                                if (parsed.state) {
                                    parsed.state.accessToken = newAccessToken;
                                    localStorage.setItem('auth-storage', JSON.stringify(parsed));
                                }
                            }
                        } catch (_e) {}
                    }
                    isRefreshing = false;
                    onTokenRefreshed();
                    // Retry the original request
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    const refreshStatus = refreshError?.response?.status;
                    console.warn('[apiClient] refresh failed', refreshStatus, refreshError.message);
                    isRefreshing = false;
                    if (typeof refreshSubscribers?.forEach === 'function') {
                        refreshSubscribers.forEach((cb) => {
                            try { cb(Promise.reject(refreshError)); } catch (_queueErr) {}
                        });
                    }
                    refreshSubscribers = [];
                    try { localStorage.removeItem('auth-storage'); } catch (_clearLocal) {}
                    try {
                        const STATE_KEY = "github_oauth_state";
                        const VERIFIER_KEY = "github_code_verifier";
                        sessionStorage.removeItem(STATE_KEY);
                        sessionStorage.removeItem(VERIFIER_KEY);
                        sessionStorage.removeItem('pending_pr_analyze');
                    } catch (_clearSession) {}
                    window.location.href = '/login';
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

        // Standardize the error response before rejecting
        let errorMessage = 'An unexpected error occurred';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        const standardizedError = new Error(errorMessage);
        standardizedError.status = error.response?.status;
        standardizedError.originalError = error;

        return Promise.reject(standardizedError);
    }
);

export default apiClient;
