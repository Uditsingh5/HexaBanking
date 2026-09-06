import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AccountStatusBadge } from "@/components/account/AccountStatus";
import { TransactionStatusBadge } from "@/components/transaction/TransactionStatusBadge";
import { useAccountStore } from "@/stores/account.store";
import { useTransactionStore } from "@/stores/transaction.store";
import { useNotificationStore } from "@/stores/notification.store";
import { accountApi } from "@/api/account.api";
import { formatMoney, maskAccountId, parseAmount } from "@/utils/format";
import {
  convertAmount,
  formatExchangeRate,
} from "@/utils/currency";
import { ACCOUNT_STATUS_COPY } from "@/constants";
import type { AccountWithBalance, Currency } from "@/types";

type Step = "form" | "review" | "result";

export function TransferPage() {
  const location = useLocation();
  const presetFrom = (location.state as { fromAccount?: string } | null)?.fromAccount;

  const accounts = useAccountStore((state) => state.accounts);
  const refreshAccounts = useAccountStore((state) => state.refreshAccounts);
  const draft = useTransactionStore((state) => state.draft);
  const setDraft = useTransactionStore((state) => state.setDraft);
  const submitTransfer = useTransactionStore((state) => state.submitTransfer);
  const startNewAttempt = useTransactionStore((state) => state.startNewAttempt);
  const resetTransfer = useTransactionStore((state) => state.resetTransfer);
  const isSubmitting = useTransactionStore((state) => state.isSubmitting);
  const transferStatus = useTransactionStore((state) => state.transferStatus);
  const currentTransfer = useTransactionStore((state) => state.currentTransfer);
  const error = useTransactionStore((state) => state.error);
  const notify = useNotificationStore((state) => state.notify);

  const [step, setStep] = useState<Step>("form");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);

  // Recipient lookup state for external accounts
  const [lookedUpAccount, setLookedUpAccount] = useState<{
    accountId: string;
    currency: Currency;
    status: string;
    holderName: string;
  } | null>(null);

  useEffect(() => {
    if (presetFrom && !draft.fromAccount) {
      const source = accounts.find((item) => item.accountId === presetFrom);
      setDraft({
        fromAccount: presetFrom,
        fromCurrency: source?.account.currency ?? null,
      });
    }
  }, [presetFrom, accounts, draft.fromAccount, setDraft]);

  const source = accounts.find((item) => item.accountId === draft.fromAccount);
  const destination = accounts.find((item) => item.accountId === draft.toAccount);
  const amountValue = parseAmount(draft.amount);

  // Look up external destination account when typed/pasted
  useEffect(() => {
    const toId = draft.toAccount?.trim();
    if (!toId) {
      setLookedUpAccount(null);
      return;
    }

    // If it's one of user's own accounts, no lookup needed
    const own = accounts.find((item) => item.accountId === toId);
    if (own) {
      setLookedUpAccount(null);
      if (draft.toCurrency !== own.account.currency) {
        setDraft({ toCurrency: own.account.currency });
      }
      return;
    }

    // If 24-character hexadecimal ObjectId, query backend lookup
    if (toId.length === 24 && /^[0-9a-fA-F]{24}$/.test(toId)) {
      void accountApi
        .lookup(toId)
        .then(({ data }) => {
          setLookedUpAccount(data);
          setDraft({ toCurrency: data.currency });
        })
        .catch(() => {
          setLookedUpAccount(null);
        });
    } else {
      setLookedUpAccount(null);
    }
  }, [draft.toAccount, accounts, draft.toCurrency, setDraft]);

  const sourceCurrency: Currency = source?.account.currency ?? draft.fromCurrency ?? "INR";
  const targetCurrency: Currency =
    destination?.account.currency ??
    lookedUpAccount?.currency ??
    draft.toCurrency ??
    sourceCurrency;

  const isCrossCurrency = sourceCurrency !== targetCurrency;
  const { convertedAmount } = convertAmount(
    amountValue || 0,
    sourceCurrency,
    targetCurrency,
  );

  const sourceOptions = useMemo(
    () =>
      accounts.map((item) => ({
        value: item.accountId,
        label: accountLabel(item),
        disabled: item.account.status !== "active",
      })),
    [accounts],
  );

  function validate() {
    const next: Record<string, string> = {};
    if (!draft.fromAccount) next.fromAccount = "Source account is required.";
    if (!draft.toAccount) next.toAccount = "Destination account is required.";
    if (draft.fromAccount && draft.toAccount && draft.fromAccount === draft.toAccount) {
      next.toAccount = "Choose a different destination account.";
    }
    if (!draft.amount.trim()) next.amount = "Amount is required.";
    else if (!Number.isFinite(amountValue) || amountValue <= 0) {
      next.amount = "Amount must be greater than zero.";
    } else if (source && amountValue > source.balance) {
      next.amount = `Amount exceeds the available balance of ${formatMoney(source.balance, source.account.currency)}.`;
    }
    if (source && source.account.status !== "active") {
      next.fromAccount = ACCOUNT_STATUS_COPY[source.account.status].description;
    }
    if (destination && destination.account.status !== "active") {
      next.toAccount = "The destination account must be active.";
    }
    if (lookedUpAccount && lookedUpAccount.status !== "active") {
      next.toAccount = "The destination account is currently not active.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToReview(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setStep("review");
  }

  async function confirm() {
    notify({ tone: "info", title: "Transfer initiated." });
    try {
      const result = await submitTransfer();
      await refreshAccounts();
      setStep("result");
      const status = result.transactionStatus ?? result.transaction?.status;
      if (status === "completed" || result.message === "Transaction already processed") {
        notify({ tone: "success", title: "Transfer completed successfully." });
      } else if (result.message === "Transaction is still processing") {
        notify({ tone: "warning", title: "Transfer is still processing." });
      }
    } catch {
      setStep("result");
      notify({
        tone: "danger",
        title: "Transfer failed.",
        description: "The server did not complete this transfer.",
      });
    }
  }

  function beginNew() {
    startNewAttempt();
    setFieldErrors({});
    setResetKey((k) => k + 1);
    setLookedUpAccount(null);
    setStep("form");
  }

  if (step === "result") {
    const tx = currentTransfer?.transaction;
    const isTxCrossCurrency =
      tx?.fromCurrency && tx?.toCurrency && tx.fromCurrency !== tx.toCurrency;

    return (
      <div className="page stack">
        <header className="page-header">
          <div>
            <p className="page-kicker">Send money</p>
            <h1 className="page-title">Transfer Result</h1>
          </div>
        </header>

        <section className="card card-pad stack" style={{ maxWidth: 540 }} aria-live="polite">
          {transferStatus === "completed" ? (
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--ink)" }}>
                Transfer completed
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                The server confirmed this ledger entry. Account balances have been refreshed.
              </p>
            </div>
          ) : transferStatus === "pending" ? (
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--ink)" }}>
                Transfer pending
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                This transfer is still settling on the ledger. Do not retry with a new key.
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--danger)" }}>
                Transfer could not be completed
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                {error ??
                  "We couldn't process this transfer right now. Please verify your account details and try again."}
              </p>
            </div>
          )}

          {tx ? (
            <div className="summary-box stack" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: 13 }}>Amount debited:</span>
                <span className="amount" style={{ fontWeight: 600, color: "var(--danger)" }}>
                  −{formatMoney(tx.amount, tx.fromCurrency ?? sourceCurrency)}
                </span>
              </div>

              {isTxCrossCurrency && (
                <>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted" style={{ fontSize: 13 }}>Exchange rate:</span>
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
                      1 {tx.fromCurrency} = {tx.exchangeRate} {tx.toCurrency}
                    </span>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted" style={{ fontSize: 13 }}>Amount credited:</span>
                    <span className="amount" style={{ fontWeight: 600, color: "var(--success)" }}>
                      +{formatMoney(tx.targetAmount ?? tx.amount, tx.toCurrency ?? targetCurrency)}
                    </span>
                  </div>
                </>
              )}

              <div
                className="row"
                style={{
                  justifyContent: "space-between",
                  paddingTop: 6,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <TransactionStatusBadge status={tx.status} />
                <span style={{ fontSize: 11.5, color: "var(--subtle)", fontFamily: "var(--font-mono)" }}>
                  ID: {tx._id}
                </span>
              </div>
            </div>
          ) : null}

          <div className="row" style={{ marginTop: 8 }}>
            <Button onClick={beginNew}>New transfer</Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetTransfer();
                setStep("form");
              }}
            >
              Back
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="page stack">
        <header className="page-header">
          <div>
            <p className="page-kicker">Send money</p>
            <h1 className="page-title">Confirm Transfer</h1>
            <p className="page-subtitle">
              Review transfer details and currency conversions before authorizing.
            </p>
          </div>
        </header>

        <section className="card card-pad stack" style={{ maxWidth: 540 }}>
          <dl className="dl">
            <dt>From</dt>
            <dd>{source ? accountLabel(source) : draft.fromAccount}</dd>

            <dt>To</dt>
            <dd>
              {destination
                ? accountLabel(destination)
                : lookedUpAccount
                ? `${lookedUpAccount.holderName} · ${maskAccountId(draft.toAccount)} (${lookedUpAccount.currency})`
                : draft.toAccount}
            </dd>

            <dt>Sending</dt>
            <dd className="amount" style={{ fontWeight: 600, color: "var(--danger)" }}>
              −{formatMoney(amountValue, sourceCurrency)}
            </dd>

            {isCrossCurrency && (
              <>
                <dt>Exchange rate</dt>
                <dd style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: 13 }}>
                  {formatExchangeRate(sourceCurrency, targetCurrency)}
                </dd>

                <dt>Recipient receives</dt>
                <dd className="amount" style={{ fontWeight: 600, color: "var(--success)" }}>
                  +{formatMoney(convertedAmount, targetCurrency)}
                </dd>
              </>
            )}
          </dl>

          {isSubmitting ? (
            <div className="summary-box" role="status">
              <div className="row">
                <span className="spinner" aria-hidden="true" />
                <div>
                  <strong style={{ fontSize: 13.5 }}>Processing transfer…</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
                    Authorizing double-entry ledger settlement.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="row" style={{ marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setStep("form")} disabled={isSubmitting}>
              Back
            </Button>
            <Button onClick={() => void confirm()} loading={isSubmitting}>
              Confirm transfer
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Send money</p>
          <h1 className="page-title">New Transfer</h1>
          <p className="page-subtitle">
            Transfer funds between your own ledgers or send to any Hexa account holder.
          </p>
        </div>
      </header>

      <form
        key={resetKey}
        className="card card-pad stack"
        style={{ maxWidth: 540 }}
        onSubmit={goToReview}
        noValidate
      >
        <Select
          label="From Account"
          name="fromAccount"
          placeholder="Select source account"
          value={draft.fromAccount}
          options={sourceOptions}
          error={fieldErrors.fromAccount}
          onChange={(event) => {
            const id = event.target.value;
            const found = accounts.find((item) => item.accountId === id);
            setDraft({ fromAccount: id, fromCurrency: found?.account.currency ?? null });
          }}
        />

        {source ? (
          <div className="summary-box">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted" style={{ fontSize: 12.5 }}>Available balance:</span>
              <AccountStatusBadge status={source.account.status} />
            </div>
            <p className="amount" style={{ fontSize: 22, margin: "6px 0 0", color: "var(--ink)" }}>
              {formatMoney(source.balance, source.account.currency)}
            </p>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="toAccount">To Account</label>
          <input
            id="toAccount"
            name="toAccount"
            className="input"
            placeholder="Paste destination Account ID"
            value={draft.toAccount}
            onChange={(event) => {
              const id = event.target.value.trim();
              const found = accounts.find((item) => item.accountId === id);
              setDraft({
                toAccount: id,
                toCurrency: found?.account.currency ?? null,
              });
            }}
            aria-invalid={Boolean(fieldErrors.toAccount)}
          />
          {fieldErrors.toAccount ? (
            <p className="field-error" role="alert">
              {fieldErrors.toAccount}
            </p>
          ) : lookedUpAccount ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--success)" }}>
              ✓ Recipient: {lookedUpAccount.holderName} ({lookedUpAccount.currency} account)
            </p>
          ) : (
            <p className="field-hint">
              Paste any Hexa Account ID or pick from your other accounts below.
            </p>
          )}
        </div>

        {/* Quick picker for own accounts */}
        {accounts.filter((item) => item.accountId !== draft.fromAccount).length > 0 ? (
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {accounts
              .filter((item) => item.accountId !== draft.fromAccount)
              .map((item) => {
                const isSelected = draft.toAccount === item.accountId;
                return (
                  <button
                    key={item.accountId}
                    type="button"
                    onClick={() =>
                      setDraft({
                        toAccount: item.accountId,
                        toCurrency: item.account.currency,
                      })
                    }
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      background: isSelected ? "var(--ink)" : "var(--surface-2)",
                      borderColor: isSelected ? "var(--ink)" : "var(--border)",
                      color: isSelected ? "var(--bg)" : "var(--muted)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.account.currency} {maskAccountId(item.account._id)}
                  </button>
                );
              })}
          </div>
        ) : null}

        <Input
          label={`Amount (${sourceCurrency})`}
          name="amount"
          inputMode="decimal"
          placeholder={amountPlaceholder(sourceCurrency)}
          value={draft.amount}
          error={fieldErrors.amount}
          onChange={(event) => setDraft({ amount: event.target.value })}
        />

        {/* Live Currency Conversion Preview Card */}
        {isCrossCurrency && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>
                Currency Conversion
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted)",
                  background: "var(--surface-3)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {formatExchangeRate(sourceCurrency, targetCurrency)}
              </span>
            </div>
            {amountValue > 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: 2,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Recipient receives:
                </span>
                <span
                  className="amount"
                  style={{ fontSize: 16, fontWeight: 600, color: "var(--success)" }}
                >
                  +{formatMoney(convertedAmount, targetCurrency)}
                </span>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "var(--subtle)" }}>
                Enter an amount to preview the converted credit.
              </p>
            )}
          </div>
        )}

        <Button type="submit" style={{ marginTop: 8 }}>
          Review transfer
        </Button>
      </form>
    </div>
  );
}

function accountLabel(item: AccountWithBalance) {
  return `${item.account.currency} · ${maskAccountId(item.account._id)} · ${formatMoney(item.balance, item.account.currency)}`;
}

function amountPlaceholder(currency: Currency | null) {
  if (currency === "USD") return "$0.00";
  if (currency === "EUR") return "€0.00";
  return "₹0.00";
}
