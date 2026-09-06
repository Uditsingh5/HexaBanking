import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AccountCard } from "@/components/account/AccountCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { TransactionStatusBadge } from "@/components/transaction/TransactionStatusBadge";
import { useAuthStore } from "@/stores/auth.store";
import { useAccountStore } from "@/stores/account.store";
import { useUiStore } from "@/stores/ui.store";
import { useTransactionStore } from "@/stores/transaction.store";
import {
  formatDateTime,
  formatMoney,
  formatTransactionAmount,
} from "@/utils/format";
import type { Currency } from "@/types";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accounts = useAccountStore((state) => state.accounts);
  const isLoading = useAccountStore((state) => state.isLoading);
  const error = useAccountStore((state) => state.error);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const setCreateAccountOpen = useUiStore((state) => state.setCreateAccountOpen);
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoadingHistory = useTransactionStore((s) => s.isLoadingHistory);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  // Build currency map from accounts for showing amounts
  const currencyMap: Record<string, Currency> = {};
  for (const item of accounts) {
    currencyMap[item.accountId] = item.account.currency;
  }

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading && accounts.length === 0) {
    return (
      <div className="page stack">
        <Skeleton style={{ height: 32, width: 280 }} />
        <div className="grid grid-3">
          <Skeleton style={{ height: 130, borderRadius: "var(--radius-lg)" }} />
          <Skeleton style={{ height: 130, borderRadius: "var(--radius-lg)" }} />
          <Skeleton style={{ height: 130, borderRadius: "var(--radius-lg)" }} />
        </div>
      </div>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <div className="page">
        <ErrorState
          title="Accounts could not be loaded"
          description={error}
          onRetry={() => void fetchAccounts()}
        />
      </div>
    );
  }

  return (
    <div className="page stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Overview</p>
          <h1 className="page-title">Welcome, {firstName}</h1>
          <p className="page-subtitle">
            Immutable double-entry ledger summaries and active account holdings.
          </p>
        </div>
      </header>

      {/* Currency summary cards (shadcn neutral stat cards) */}
      <section className="grid grid-3">
        {summaries(accounts).map((summary) => (
          <article key={summary.currency} className="card card-pad">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span className="account-currency">{summary.currency} Portfolio</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--subtle)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                {summary.count} {summary.count === 1 ? "account" : "accounts"}
              </span>
            </div>
            <p className="amount account-balance" style={{ fontSize: 26, marginTop: 12 }}>
              {formatMoney(summary.total, summary.currency)}
            </p>
          </article>
        ))}
      </section>

      {/* Accounts list */}
      <section>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Accounts</h2>
          <Button size="sm" onClick={() => setCreateAccountOpen(true)}>
            Create account
          </Button>
        </div>
        {accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            description="Create your first account to start using Hexa Secure Banking."
            action={
              <Button onClick={() => setCreateAccountOpen(true)}>Create account</Button>
            }
          />
        ) : (
          <div className="grid grid-3">
            {accounts.map((item) => (
              <AccountCard key={item.accountId} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions + Recent activity */}
      <section className="grid grid-2">
        <article className="card card-pad">
          <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
            Quick actions
          </h2>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
            Transfers are server-authorized with double-entry cryptographic verification.
          </p>
          <div className="row" style={{ marginTop: 18 }}>
            <Link className="btn" to="/app/transfer">
              Send money
            </Link>
            <Button variant="secondary" onClick={() => setCreateAccountOpen(true)}>
              Create account
            </Button>
          </div>
        </article>

        <article className="card card-pad">
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
              Recent activity
            </h2>
            <Link
              to="/app/transactions"
              style={{
                fontSize: 12.5,
                color: "var(--muted)",
                fontWeight: 500,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              View all →
            </Link>
          </div>

          {isLoadingHistory && recentTransactions.length === 0 ? (
            <div className="stack" style={{ gap: 8 }}>
              <Skeleton style={{ height: 44, borderRadius: "var(--radius-sm)" }} />
              <Skeleton style={{ height: 44, borderRadius: "var(--radius-sm)" }} />
            </div>
          ) : recentTransactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentTransactions.map((tx) => {
                const isAdminFund =
                  tx.type === "admin_fund" ||
                  tx.fromAccount === tx.toAccount ||
                  tx.idempotencyKey?.startsWith("admin-fund-");

                const isDebit = !isAdminFund && currencyMap[tx.fromAccount] !== undefined;
                const isCredit = isAdminFund || (!isDebit && currencyMap[tx.toAccount] !== undefined);
                const isCrossCurrency = Boolean(
                  tx.fromCurrency &&
                  tx.toCurrency &&
                  tx.fromCurrency !== tx.toCurrency
                );

                const currency: Currency =
                  (isDebit
                    ? tx.fromCurrency ?? currencyMap[tx.fromAccount]
                    : tx.toCurrency ?? currencyMap[tx.toAccount]) ??
                  currencyMap[tx.fromAccount] ??
                  currencyMap[tx.toAccount] ??
                  "INR";

                const isFailed = tx.status === "failed" || tx.status === "reversed";

                const amountColor = isFailed
                  ? "var(--subtle)"
                  : isAdminFund
                  ? "var(--ink)"
                  : isCredit
                  ? "var(--success)"
                  : "var(--danger)";

                const iconBg = isFailed
                  ? "var(--surface-2)"
                  : isAdminFund
                  ? "var(--surface-3)"
                  : isCredit
                  ? "var(--success-soft)"
                  : "var(--danger-soft)";

                const iconBorder = isFailed
                  ? "var(--border)"
                  : isAdminFund
                  ? "var(--border-strong)"
                  : isCredit
                  ? "var(--success-border)"
                  : "var(--danger-border)";

                const iconColor = isFailed
                  ? "var(--subtle)"
                  : isAdminFund
                  ? "var(--ink)"
                  : isCredit
                  ? "var(--success)"
                  : "var(--danger)";

                const rawAmount =
                  isCrossCurrency && isCredit
                    ? tx.targetAmount ?? tx.amount
                    : tx.amount;

                const formattedAmount = formatTransactionAmount(
                  rawAmount,
                  currency as Currency,
                  isCredit ? "credit" : "debit",
                  isAdminFund,
                );

                return (
                  <div
                    key={tx._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                      gap: 12,
                    }}
                  >
                    <div className="row" style={{ gap: 10, minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-full)",
                          background: iconBg,
                          border: `1px solid ${iconBorder}`,
                          color: iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: isAdminFund ? 14 : 12,
                          fontWeight: isAdminFund ? 700 : 500,
                        }}
                      >
                        {isAdminFund ? (
                          <span style={{ fontFamily: "var(--font-mono)" }}>⊕</span>
                        ) : isCredit ? (
                          <ArrowDownLeft size={13} strokeWidth={2.2} />
                        ) : (
                          <ArrowUpRight size={13} strokeWidth={2.2} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--ink)",
                            }}
                          >
                            {isAdminFund
                              ? "Admin Credit"
                              : isCredit
                              ? "Received"
                              : "Sent"}
                          </span>
                          <TransactionStatusBadge status={tx.status} />
                        </div>
                        <p style={{ margin: 0, fontSize: 11.5, color: "var(--subtle)" }}>
                          {formatDateTime(tx.createdAt)}
                          {isCrossCurrency && tx.exchangeRate ? (
                            <span style={{ marginLeft: 6 }}>
                              · {tx.fromCurrency} → {tx.toCurrency}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <span
                      className="amount"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: amountColor,
                        whiteSpace: "nowrap",
                        textDecoration: isFailed ? "line-through" : "none",
                        opacity: isFailed ? 0.6 : 1,
                      }}
                    >
                      {formattedAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              No transactions yet. Make a transfer to see activity here.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

function summaries(accounts: ReturnType<typeof useAccountStore.getState>["accounts"]) {
  const currencies: Currency[] = ["INR", "USD", "EUR"];
  return currencies.map((currency) => {
    const items = accounts.filter((item) => item.account.currency === currency);
    return {
      currency,
      count: items.length,
      total: items.reduce((sum, item) => sum + item.balance, 0),
    };
  });
}
