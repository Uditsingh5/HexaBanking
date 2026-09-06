import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MobileNavigation, Sidebar } from "@/components/layout/Sidebar";
import { CreateAccountDialog } from "@/components/account/CreateAccountDialog";
import { useAccountStore } from "@/stores/account.store";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

export function AppShell() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasLoaded = useAccountStore((state) => state.hasLoaded);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const createAccountOpen = useUiStore((state) => state.createAccountOpen);
  const setCreateAccountOpen = useUiStore((state) => state.setCreateAccountOpen);

  useEffect(() => {
    if (isInitialized && !hasLoaded) {
      void fetchAccounts();
    }
  }, [fetchAccounts, hasLoaded, isInitialized]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Header />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
      <CreateAccountDialog
        open={createAccountOpen}
        onClose={() => setCreateAccountOpen(false)}
      />
    </div>
  );
}
