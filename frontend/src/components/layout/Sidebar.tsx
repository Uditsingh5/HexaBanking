import { NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useAccountStore } from "@/stores/account.store";
import { Button } from "@/components/ui/Button";

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/accounts", label: "Accounts", icon: CreditCard },
  { to: "/app/transfer", label: "Send Money", icon: ArrowUpRight },
  { to: "/app/transactions", label: "Transactions", icon: Receipt },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearAccounts = useAccountStore((state) => state.clearAccounts);
  const notify = useNotificationStore((state) => state.notify);
  const isAdmin = user?.role === "admin";

  async function handleLogout() {
    await logout();
    clearAccounts();
    notify({ tone: "info", title: "Logged out successfully." });
  }

  return (
    <aside className={open ? "sidebar open" : "sidebar"} aria-label="Primary">
      <NavLink to="/app/dashboard" className="sidebar-brand" onClick={onNavigate}>
        <img
          src="/logo.png"
          alt="Hexa Bank Logo"
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            objectFit: "contain",
          }}
        />
        <span className="sidebar-name">Hexa Bank</span>
      </NavLink>

      <nav className="nav-list">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={onNavigate}
          >
            <link.icon size={15} aria-hidden="true" />
            {link.label}
          </NavLink>
        ))}

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div
              style={{
                margin: "16px 0 6px",
                padding: "0 10px",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--subtle)",
              }}
            >
              Administration
            </div>
            <NavLink
              to="/app/admin/add-money"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={onNavigate}
            >
              <ShieldCheck size={15} aria-hidden="true" />
              Add Money
            </NavLink>
          </>
        )}
      </nav>

      <div className="nav-spacer" />
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid var(--border)",
          marginTop: 12,
        }}
      >
        <p className="muted" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.4 }}>
          Double-entry ledger · Session protected
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          style={{
            marginTop: 8,
            width: "100%",
            justifyContent: "flex-start",
            color: "var(--muted)",
          }}
        >
          <LogOut size={14} aria-hidden="true" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  return (
    <nav className="mobile-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/app/dashboard"
        className={({ isActive }) =>
          isActive ? "mobile-nav-item active" : "mobile-nav-item"
        }
      >
        <LayoutDashboard size={18} strokeWidth={2} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/app/accounts"
        className={({ isActive }) =>
          isActive ? "mobile-nav-item active" : "mobile-nav-item"
        }
      >
        <CreditCard size={18} strokeWidth={2} />
        <span>Accounts</span>
      </NavLink>

      <NavLink
        to="/app/transfer"
        className={({ isActive }) =>
          isActive ? "mobile-nav-item active" : "mobile-nav-item"
        }
      >
        <ArrowUpRight size={18} strokeWidth={2} />
        <span>Transfer</span>
      </NavLink>

      <NavLink
        to="/app/transactions"
        className={({ isActive }) =>
          isActive ? "mobile-nav-item active" : "mobile-nav-item"
        }
      >
        <Receipt size={18} strokeWidth={2} />
        <span>Activity</span>
      </NavLink>

      {isAdmin ? (
        <NavLink
          to="/app/admin/add-money"
          className={({ isActive }) =>
            isActive ? "mobile-nav-item active" : "mobile-nav-item"
          }
        >
          <ShieldCheck size={18} strokeWidth={2} />
          <span>Admin</span>
        </NavLink>
      ) : (
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            isActive ? "mobile-nav-item active" : "mobile-nav-item"
          }
        >
          <UserRound size={18} strokeWidth={2} />
          <span>Profile</span>
        </NavLink>
      )}
    </nav>
  );
}
