import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/lib/errors";

export function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await register(name.trim(), email.trim(), password);
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      setErrors({ form: getErrorMessage(error, "Registration failed. Please try again.") });
    }
  }

  return (
    <div className="auth-layout">
      {/* Left panel */}
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
            Open a secure workspace.
          </h1>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--muted)",
              maxWidth: "44ch",
            }}
          >
            Create an account to manage multi-currency ledgers in INR, USD, or EUR.
            Balances are mathematically guaranteed by double-entry records.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 32 }}>
            {[
              "Multi-currency accounts",
              "Instant verification",
              "Double-entry bookkeeping",
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
          Registration triggers automated cryptographic key setup for your workspace.
        </p>
      </section>

      {/* Right form */}
      <div className="auth-form-wrap">
        <form className="auth-form stack" onSubmit={onSubmit} noValidate>
          <div>
            <p className="page-kicker">Get started</p>
            <h2 className="page-title" style={{ fontSize: 24 }}>
              Create your profile
            </h2>
            <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
              Set up your account to start managing your banking workspace.
            </p>
          </div>

          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
          />
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
            autoComplete="new-password"
            hint="At least 6 characters."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />

          {errors.form ? (
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
          ) : null}

          <Button type="submit" loading={isLoading} style={{ minHeight: 40, fontSize: 14 }}>
            Create account
          </Button>

          <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 4 }}>
            Already registered?{" "}
            <Link
              to="/login"
              style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline" }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
