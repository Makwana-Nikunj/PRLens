import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] light:bg-[#ffffff] text-white light:text-[#18181f]">
        <span className="material-symbols-outlined text-4xl animate-spin text-[#a3cc00] light:text-[#ccff00]">progress_activity</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
