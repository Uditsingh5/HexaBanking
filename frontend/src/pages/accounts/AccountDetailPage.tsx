import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccountStore } from "@/stores/account.store";
import { AccountBalance } from "@/components/account/AccountBalance";
import { AccountStatusBadge } from "@/components/account/AccountStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/EmptyState";
import { ACCOUNT_STATUS_COPY } from "@/constants";
import { formatDateTime, maskAccountId } from "@/utils/format";

export function AccountDetailPage() {
  const { accountId } = useParams();
  const fetchAccount = useAccountStore((state) => state.fetchAccount);
  const selected = useAccountStore((state) => state.selectedAccount);
  const isLoading = useAccountStore((state) => state.isLoading);
  const error = useAccountStore((state) => state.error);

  useEffect(() => {
    if (accountId) void fetchAccount(accountId);
  }, [accountId, fetchAccount]);

  if (isLoading && !selected) {
    return (
      <div className="page">
        <Skeleton style={{ height: 32, width: 240, marginBottom: 20 }} />
        <Skeleton style={{ height: 220 }} />
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div className="page">
        <ErrorState
          title="Account not found"
          description={error ?? "This account is unavailable or you do not have access."}
        />
      </div>
    );
  }

  const { account, balance } = selected;
  const canTransfer = account.status === "active";

  return (
    <div className="page stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Account details</p>
          <h1 className="page-title">{account.currency} account</h1>
          <p className="page-subtitle">{maskAccountId(account._id)}</p>
        </div>
        <AccountStatusBadge status={account.status} />
      </header>

      <section className="card card-pad">
        <p className="account-currency">Current balance</p>
        <AccountBalance amount={balance} currency={account.currency} />
        <p className="muted" style={{ marginTop: 8 }}>
          This figure is calculated by the server from ledger entries. It is not stored as a mutable field in the app.
        </p>
      </section>

      {!canTransfer ? (
        <section className="card card-pad" role="status">
          <h2 style={{ marginTop: 0, fontSize: 18 }}>{ACCOUNT_STATUS_COPY[account.status].label}</h2>
          <p className="muted">{ACCOUNT_STATUS_COPY[account.status].description}</p>
        </section>
      ) : null}

      <section className="card card-pad">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Identity</h2>
        <dl className="dl">
          <dt>Account ID</dt>
          <dd>{account._id}</dd>
          <dt>Currency</dt>
          <dd>{account.currency}</dd>
          <dt>Status</dt>
          <dd>{ACCOUNT_STATUS_COPY[account.status].label}</dd>
          <dt>Opened</dt>
          <dd>{formatDateTime(account.createdAt)}</dd>
        </dl>
      </section>

      <section className="card card-pad">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Actions</h2>
        {canTransfer ? (
          <Link className="btn" to="/app/transfer" state={{ fromAccount: account._id }}>
            Send money from this account
          </Link>
        ) : (
          <p className="muted">Transfers from this account are currently unavailable.</p>
        )}
      </section>
    </div>
  );
}
