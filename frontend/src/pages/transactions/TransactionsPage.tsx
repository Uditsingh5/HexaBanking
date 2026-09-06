import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { TransactionStatusBadge } from "@/components/transaction/TransactionStatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useTransactionStore } from "@/stores/transaction.store";
import { useAccountStore } from "@/stores/account.store";
import {
  formatDateTime,
  formatMoney,
  formatTransactionAmount,
  maskAccountId,
} from "@/utils/format";
import type { TransactionStatus, Currency } from "@/types";

const STATUS_FILTERS: { label: string; value: TransactionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Reversed", value: "reversed" },
];

export function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoadingHistory = useTransactionStore((s) => s.isLoadingHistory);
  const historyError = useTransactionStore((s) => s.historyError);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const accounts = useAccountStore((s) => s.accounts);

  const [activeFilter, setActiveFilter] = useState<TransactionStatus | "all">("all");

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  // Build sets for quick lookup
  const myAccountIds = new Set(accounts.map((a) => a.accountId));
  const currencyMap: Record<string, Currency> = {};
  for (const item of accounts) {
    currencyMap[item.accountId] = item.account.currency;
  }

  const filtered =
    activeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.status === activeFilter);

  return (
    <div className="page stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Transactions</p>
          <h1 className="page-title">Activity</h1>
          <p className="page-subtitle">
            Immutable ledger records for all inbound, outbound, and multi-currency transactions.
          </p>
        </div>
      </header>

      {/* Filter bar (shadcn neutral segmented control) */}
      <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
        {STATUS_FILTERS.map(({ label, value }) => {
          const count =
            value === "all"
              ? transactions.length
              : transactions.filter((t) => t.status === value).length;
          const isActive = activeFilter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                background: isActive ? "var(--ink)" : "var(--surface-2)",
                borderColor: isActive ? "var(--ink)" : "var(--border)",
                color: isActive ? "var(--bg)" : "var(--muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: "var(--radius-full)",
                    background: isActive ? "rgba(0,0,0,0.15)" : "var(--surface-3)",
                    color: isActive ? "var(--bg)" : "var(--ink-soft)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => void fetchTransactions()}
          disabled={isLoadingHistory}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 500,
            opacity: isLoadingHistory ? 0.5 : 1,
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
          <RefreshCw
            size={13}
            style={{ animation: isLoadingHistory ? "spin 1s linear infinite" : "none" }}
          />
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoadingHistory && transactions.length === 0 && (
        <div className="stack" style={{ gap: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ height: 68, borderRadius: "var(--radius)" }} />
          ))}
        </div>
      )}

      {/* Error */}
      {historyError && transactions.length === 0 && (
        <ErrorState
          title="Unable to load transactions"
          description={historyError}
          onRetry={() => void fetchTransactions()}
        />
      )}

      {/* Empty */}
      {!isLoadingHistory && !historyError && filtered.length === 0 && (
        <EmptyState
          title={
            activeFilter === "all"
              ? "No transactions yet"
              : `No ${activeFilter} transactions`
          }
          description={
            activeFilter === "all"
              ? "Your ledger activity will appear here once you initiate a transfer."
              : `You have no transactions with status "${activeFilter}".`
          }
          action={
            activeFilter === "all" ? (
              <Link className="btn" to="/app/transfer">
                Send money
              </Link>
            ) : (
              <Button variant="secondary" onClick={() => setActiveFilter("all")}>
                Clear filter
              </Button>
            )
          }
        />
      )}

      {/* Transaction list (shadcn neutral list) */}
      {filtered.length > 0 && (
        <section className="card" style={{ overflow: "hidden", padding: 0 }}>
          {filtered.map((tx, idx) => {
            const isAdminFund =
              tx.type === "admin_fund" ||
              tx.fromAccount === tx.toAccount ||
              tx.idempotencyKey?.startsWith("admin-fund-");

            const isDebit = !isAdminFund && myAccountIds.has(tx.fromAccount);
            const isCredit = isAdminFund || (myAccountIds.has(tx.toAccount) && !isDebit);
            const isFailed = tx.status === "failed" || tx.status === "reversed";

            const isCrossCurrency = Boolean(
              tx.fromCurrency &&
              tx.toCurrency &&
              tx.fromCurrency !== tx.toCurrency
            );

            // Determine relevant currency for this user view
            const currency: Currency =
              (isDebit
                ? tx.fromCurrency ?? currencyMap[tx.fromAccount]
                : tx.toCurrency ?? currencyMap[tx.toAccount]) ??
              currencyMap[tx.fromAccount] ??
              currencyMap[tx.toAccount] ??
              "INR";

            const isLast = idx === filtered.length - 1;

            // Semantic amount color
            const amountColor = isFailed
              ? "var(--subtle)"
              : isAdminFund
              ? "var(--ink)"
              : isCredit
              ? "var(--success)"
              : "var(--danger)";

            // Direction badge styles
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

            // Amount calculation
            const rawAmount =
              isCrossCurrency && isCredit
                ? tx.targetAmount ?? tx.amount
                : tx.amount;

            // Format amount with XOR sign '⊕' if admin added money
            const formattedAmount = formatTransactionAmount(
              rawAmount,
              currency,
              isCredit ? "credit" : "debit",
              isAdminFund,
            );

            return (
              <div
                key={tx._id}
                style={{
                  padding: "16px 20px",
                  borderBottom: isLast ? "none" : "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Direction / XOR icon badge */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-full)",
                    background: iconBg,
                    border: `1px solid ${iconBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: iconColor,
                    fontSize: isAdminFund ? 17 : 14,
                    fontWeight: isAdminFund ? 700 : 500,
                  }}
                  title={isAdminFund ? "Admin Deposit (⊕)" : isCredit ? "Credit" : "Debit"}
                >
                  {isAdminFund ? (
                    <span style={{ lineHeight: 1, fontFamily: "var(--font-mono)" }}>⊕</span>
                  ) : isCredit ? (
                    <ArrowDownLeft size={16} strokeWidth={2.2} />
                  ) : (
                    <ArrowUpRight size={16} strokeWidth={2.2} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="row"
                    style={{ gap: 8, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                      {isAdminFund
                        ? "Admin Deposit"
                        : isCredit
                        ? "Received funds"
                        : "Sent payment"}
                    </span>
                    <TransactionStatusBadge status={tx.status} />
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--subtle)",
                        marginLeft: "auto",
                      }}
                    >
                      {formatDateTime(tx.createdAt)}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
                    {isAdminFund ? (
                      <>
                        Direct admin credit into{" "}
                        <span style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>
                          {maskAccountId(tx.toAccount)}
                        </span>
                      </>
                    ) : isCredit ? (
                      <>
                        From{" "}
                        <span style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>
                          {maskAccountId(tx.fromAccount)}
                        </span>{" "}
                        → you
                        {isCrossCurrency && tx.fromCurrency && (
                          <span style={{ marginLeft: 6, color: "var(--subtle)" }}>
                            (converted from {formatMoney(tx.amount, tx.fromCurrency)})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        To{" "}
                        <span style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>
                          {maskAccountId(tx.toAccount)}
                        </span>
                        {isCrossCurrency && tx.toCurrency && (
                          <span style={{ marginLeft: 6, color: "var(--subtle)" }}>
                            (recipient gets {formatMoney(tx.targetAmount ?? tx.amount, tx.toCurrency)})
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Amount formatted with XOR sign ⊕ for admin, or + / − */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    className="amount"
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: amountColor,
                      textDecoration: isFailed ? "line-through" : "none",
                      opacity: isFailed ? 0.6 : 1,
                    }}
                  >
                    {formattedAmount}
                  </p>
                  {isFailed ? (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "var(--subtle)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                      }}
                    >
                      {tx.status}
                    </span>
                  ) : isCrossCurrency && tx.exchangeRate ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--subtle)",
                        fontFamily: "var(--font-mono)",
                        display: "block",
                      }}
                    >
                      Rate: {tx.exchangeRate}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
