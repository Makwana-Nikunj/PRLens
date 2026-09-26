import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";
import useAuthStore from "../store/authStore";

function extractMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

/**
 * Hook for email + password authentication flows.
 *
 * @param {{ redirectPath?: string }} options
 */
function useEmailAuth({ redirectPath = "/dashboard" } = {}) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuthSuccess = (userData, accessToken) => {
    login({ userData, accessToken: accessToken || null });
    navigate(redirectPath, { replace: true });
  };

  const signup = async ({ email, password, name }) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/register", {
        email,
        password,
        name,
      });
      // DO NOT call handleAuthSuccess here. Signup must not establish a
      // session — the user has to verify their email and explicitly log in.
      // The page handles the post-signup navigation to /verify-email-pending.
      return data;
    } catch (err) {
      const message = extractMessage(err, "Sign-up failed. Please try again.");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      // The backend sets the access + refresh tokens as httpOnly cookies on
      // the response — they do NOT appear in the body. The body only
      // carries the user shape, which lives at data.data.user.
      if (data?.data?.user) {
        handleAuthSuccess(data.data.user, null);
      }
      return data;
    } catch (err) {
      // 403 = email not verified yet. Take the user to the "check your inbox" page.
      if (err?.response?.status === 403) {
        navigate("/verify-email-pending", {
          replace: true,
          state: { email },
        });
        return; // don't setError — the page explains it
      }
      const message = extractMessage(err, "Invalid email or password");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/verify-email", { token });
      return data;
    } catch (err) {
      const message = extractMessage(err, "Verification failed");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      return data;
    } catch (err) {
      const message = extractMessage(err, "Could not request password reset");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitPasswordReset = async ({ email, otp, newPassword }) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return data;
    } catch (err) {
      const message = extractMessage(err, "Could not reset password");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/resend-verification", {
        email,
      });
      return data;
    } catch (err) {
      const message = extractMessage(err, "Could not resend verification email");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/auth/me");
      return data;
    } catch (err) {
      const message = extractMessage(err, "Could not fetch current user");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    loginWithEmail,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    submitPasswordReset,
    getCurrentUser,
    isLoading,
    error,
  };
}

export default useEmailAuth;
