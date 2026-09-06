import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/lib/errors";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ form: getErrorMessage(error, "Sign in failed. Please try again.") });
    }
  }

  return (
    <div className="auth-layout">
      {/* Left panel (Aceternity neutral hero) */}
      <section className="auth-panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <img
              src="/logo.png"
              alt="Hexa Bank Logo"
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              Hexa Bank
            </span>
          </div>

          <h1
            style={{
              maxWidth: "16ch",
              fontSize: 36,
              marginBottom: 16,
              lineHeight: 1.15,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            Banking built on the ledger.
          </h1>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--muted)",
              maxWidth: "44ch",
            }}
          >
            Every balance is derived from immutable double-entry ledger records. Transfers
            are cryptographically verified with zero balance fabrication.
          </p>

          {/* Feature chips (shadcn neutral pills) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 32 }}>
            {[
              "Double-entry ledgers",
              "HttpOnly session security",
              "Idempotent transfers",
              "Zero balance fabrication",
            ].map((f) => (
              <span
                key={f}
                style={{
                  padding: "4px 10px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink-soft)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="muted" style={{ fontSize: 12, margin: 0 }}>
          © 2026 Hexa Secure Banking · Cryptographically verified ledger architecture
        </p>
      </section>

      {/* Right form (shadcn neutral form) */}
      <div className="auth-form-wrap">
        <form className="auth-form stack" onSubmit={onSubmit} noValidate>
          <div>
            <p className="page-kicker">Sign in</p>
            <h2 className="page-title" style={{ fontSize: 24 }}>
              Welcome back
            </h2>
            <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
              Enter your credentials to access your accounts.
            </p>
          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />

          {errors.form && (
            <p
              className="field-error"
              role="alert"
              style={{
                background: "var(--danger-soft)",
                border: "1px solid var(--danger-border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
              }}
            >
              {errors.form}
            </p>
          )}

          <Button type="submit" loading={isLoading} style={{ minHeight: 40, fontSize: 14 }}>
            Sign in
          </Button>

          <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 4 }}>
            No account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline" }}
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
