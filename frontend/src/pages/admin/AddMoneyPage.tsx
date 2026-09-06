import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAccountStore } from "@/stores/account.store";
import { useNotificationStore } from "@/stores/notification.store";
import { transactionApi } from "@/api/transaction.api";

export function AddMoneyPage() {
  const refreshAccounts = useAccountStore((s) => s.refreshAccounts);
  const notify = useNotificationStore((s) => s.notify);

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<{ message: string; newBalance: number } | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!accountId.trim()) {
      setError("Account ID is required.");
      return;
    }
    const parsed = Number(amount);
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await transactionApi.adminFund({
        toAccount: accountId.trim(),
        amount: parsed,
      });
      setSuccess({ message: data.message, newBalance: data.newBalance });
      notify({
        tone: "success",
        title: `₹${parsed.toLocaleString("en-IN")} added successfully.`,
      });
      setAccountId("");
      setAmount("");
      void refreshAccounts();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to add funds. Check the account ID and try again.";
      setError(msg);
      notify({ tone: "danger", title: "Failed to add funds." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Admin</p>
          <h1 className="page-title">Add Money</h1>
          <p className="page-subtitle">
            Directly credit arbitrary liquidity to any target ledger account ID.
          </p>
        </div>
      </header>

      <form
        className="card card-pad stack"
        onSubmit={onSubmit}
        noValidate
        style={{ maxWidth: 460 }}
      >
        {/* Account ID */}
        <div className="field">
          <label htmlFor="admin-account-id">Account ID</label>
          <input
            id="admin-account-id"
            className="input"
            placeholder="Paste full Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="field-hint">
            Available under Accounts → select account → Account ID.
          </p>
        </div>

        {/* Amount */}
        <div className="field">
          <label htmlFor="admin-amount">Amount (₹)</label>
          <input
            id="admin-amount"
            className="input"
            inputMode="decimal"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {error && <p className="field-error" role="alert">{error}</p>}

        <Button type="submit" loading={isLoading}>
          Add funds
        </Button>
      </form>

      {/* Success card */}
      {success && (
        <div
          className="card card-pad"
          style={{
            maxWidth: 460,
            borderLeft: "3px solid var(--success)",
            background: "var(--surface)",
          }}
        >
          <p style={{ margin: "0 0 6px", fontWeight: 600, color: "var(--success)" }}>
            ✓ Transfer completed
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            {success.message}
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 14 }}>
            New balance:{" "}
            <strong className="amount" style={{ color: "var(--ink)" }}>
              ₹{success.newBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
