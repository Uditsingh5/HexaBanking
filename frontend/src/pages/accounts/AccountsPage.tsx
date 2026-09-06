import { AccountCard } from "@/components/account/AccountCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { useAccountStore } from "@/stores/account.store";
import { useUiStore } from "@/stores/ui.store";

export function AccountsPage() {
  const accounts = useAccountStore((state) => state.accounts);
  const isLoading = useAccountStore((state) => state.isLoading);
  const error = useAccountStore((state) => state.error);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const setCreateAccountOpen = useUiStore((state) => state.setCreateAccountOpen);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Accounts</p>
          <h1 className="page-title">Your ledgers</h1>
          <p className="page-subtitle">
            Each account has its own currency. Totals are never mixed across INR, USD, and EUR.
          </p>
        </div>
        <Button onClick={() => setCreateAccountOpen(true)}>Create account</Button>
      </header>

      {isLoading && accounts.length === 0 ? (
        <div className="grid grid-3">
          <Skeleton style={{ height: 210 }} />
          <Skeleton style={{ height: 210 }} />
          <Skeleton style={{ height: 210 }} />
        </div>
      ) : error && accounts.length === 0 ? (
        <ErrorState title="Unable to load accounts" description={error} onRetry={() => void fetchAccounts()} />
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start using Hexa Secure Banking."
          action={<Button onClick={() => setCreateAccountOpen(true)}>Create account</Button>}
        />
      ) : (
        <div className="grid grid-3">
          {accounts.map((item) => (
            <AccountCard key={item.accountId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
