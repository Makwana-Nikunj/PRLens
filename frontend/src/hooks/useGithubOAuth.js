import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";
import useAuthStore from "../store/authStore";

const STATE_KEY = "github_oauth_state";
const VERIFIER_KEY = "github_code_verifier";

function generateState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateCodeVerifier() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * @param {{ onSuccess?: Function, redirectPath?: string }} options
 */
function useGithubOAuth({ onSuccess, redirectPath = "/dashboard" } = {}) {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [isGithubLoading, setIsGithubLoading] = useState(false);
    const isProcessingRef = useRef(false);

    // Handle GitHub OAuth redirect callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");
        const storedState = sessionStorage.getItem(STATE_KEY);

        // Success path: GitHub returned with code
        if (code) {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            // CSRF check: validate state parameter
            if (!returnedState || !storedState || returnedState !== storedState) {
                console.error("GitHub login failed: state mismatch. Please try again.");
                sessionStorage.removeItem(STATE_KEY);
                sessionStorage.removeItem(VERIFIER_KEY);
                window.history.replaceState({}, "", window.location.pathname);
                return;
            }

            const codeVerifier = sessionStorage.getItem(VERIFIER_KEY);
            let isMounted = true;

            const handleOAuthCallback = async () => {
                try {
                    if (isMounted) setIsGithubLoading(true);
                    const response = await apiClient.post("/auth/oauth", {
                        code,
                        codeVerifier,
                        redirectUri: `${window.location.origin}/login`,
                        provider: "github",
                    });

                    if (response.data?.data) {
                        const userData = response.data.data;
                        login({
                            userData,
                            accessToken: response.data.data.accessToken || null,
                        });

                        console.log(`Welcome, ${userData.name || userData.username || "User"}!`);
                        sessionStorage.removeItem(STATE_KEY);
                        sessionStorage.removeItem(VERIFIER_KEY);

                        if (onSuccess) {
                            onSuccess(userData);
                        } else {
                            if (isMounted) navigate(redirectPath, { replace: true });
                        }
                    }
                } catch (err) {
                    console.error(`GitHub login failed. ${err.response?.data?.message || "Please try again."}`);
                    sessionStorage.removeItem(STATE_KEY);
                    sessionStorage.removeItem(VERIFIER_KEY);
                    window.history.replaceState({}, "", window.location.pathname);
                } finally {
                    if (isMounted) setIsGithubLoading(false);
                }
            };

            handleOAuthCallback();

            return () => {
                isMounted = false;
            };
        }

        // Cancelled/failed path
        if (params.get("error")) {
            console.error("GitHub login was cancelled or failed. Please try again.");
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [login, navigate, redirectPath, onSuccess]);

    const handleGithubLogin = async () => {
        setIsGithubLoading(true);

        const state = generateState();
        sessionStorage.setItem(STATE_KEY, state);

        const verifier = generateCodeVerifier();
        sessionStorage.setItem(VERIFIER_KEY, verifier);

        const challenge = await generateCodeChallenge(verifier);

        const params = new URLSearchParams({
            client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
            redirect_uri: `${window.location.origin}/login`,
            scope: "read:user user:email repo",
            state,
            code_challenge: challenge,
            code_challenge_method: "S256"
        });

        window.location.href = `https://github.com/login/oauth/authorize?${params}`;
    };

    return { handleGithubLogin, isGithubLoading };
}

export { generateState };
export default useGithubOAuth;
