import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="topbar">
      <div className="row" style={{ gap: 10, alignItems: "center" }}>
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
        <span
          style={{
            fontWeight: 600,
            fontSize: 14.5,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          Hexa Bank
        </span>

        <span
          style={{
            width: 1,
            height: 16,
            background: "var(--border)",
            margin: "0 2px",
          }}
        />

        {/* Subtle Live ledger indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--success)",
              display: "inline-block",
            }}
          />
          Ledger active
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        {/* Admin badge */}
        {isAdmin && (
          <span
            style={{
              padding: "2px 8px",
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink-soft)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            Admin
          </span>
        )}

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <Bell size={14} />
        </button>

        {/* User profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "3px 8px 3px 4px",
            borderRadius: "var(--radius-full)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "var(--radius-full)",
              background: "var(--surface-3)",
              border: "1px solid var(--border-strong)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 11,
              color: "var(--ink)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {initials}
          </div>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--ink-soft)",
              paddingRight: 4,
            }}
          >
            {user?.name ?? "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
