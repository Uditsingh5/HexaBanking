import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useAccountStore } from "@/stores/account.store";
import { initializeTheme } from "@/stores/ui.store";
import { ToastViewport } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearAccounts = useAccountStore((state) => state.clearAccounts);
  const navigate = useNavigate();

  useEffect(() => {
    initializeTheme();
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    function onUnauthorized() {
      if (!useAuthStore.getState().isInitialized) return;
      clearAuth();
      clearAccounts();
      navigate("/login", { replace: true });
    }
    window.addEventListener("hexa:unauthorized", onUnauthorized);
    return () => window.removeEventListener("hexa:unauthorized", onUnauthorized);
  }, [clearAuth, clearAccounts, navigate]);

  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}
