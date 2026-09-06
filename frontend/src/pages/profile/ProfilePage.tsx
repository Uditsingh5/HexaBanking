import { useAuthStore } from "@/stores/auth.store";
import { useAccountStore } from "@/stores/account.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Button } from "@/components/ui/Button";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearAccounts = useAccountStore((state) => state.clearAccounts);
  const notify = useNotificationStore((state) => state.notify);

  async function handleLogout() {
    await logout();
    clearAccounts();
    notify({ tone: "info", title: "Logged out successfully." });
  }

  return (
    <div className="page stack">
      <header>
        <p className="page-kicker">Profile</p>
        <h1 className="page-title">Account holder</h1>
        <p className="page-subtitle">
          Only fields provided by the authentication service are shown. Password changes are not available.
        </p>
      </header>

      <section className="card card-pad">
        <dl className="dl">
          <dt>Name</dt>
          <dd>{user?.name ?? "Unavailable for this session"}</dd>
          <dt>Email</dt>
          <dd>{user?.email ?? "—"}</dd>
          <dt>User ID</dt>
          <dd>{user?._id ?? "—"}</dd>
          <dt>Session</dt>
          <dd>Authenticated with a secure cookie session</dd>
        </dl>
      </section>

      <section className="card card-pad">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Sign out</h2>
        <p className="muted">This ends the current session and blacklists the token on the server.</p>
        <Button variant="danger" onClick={() => void handleLogout()} style={{ marginTop: 12 }}>
          Logout
        </Button>
      </section>
    </div>
  );
}
