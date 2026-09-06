import { Link } from "react-router-dom";
import type { AccountWithBalance } from "@/types";
import { maskAccountId } from "@/utils/format";
import { AccountBalance } from "@/components/account/AccountBalance";
import { AccountStatusBadge } from "@/components/account/AccountStatus";

export function AccountCard({ item }: { item: AccountWithBalance }) {
  const { account, balance } = item;

  return (
    <article className="card account-card">
      <div className="account-card-top">
        <p className="account-currency">{account.currency} account</p>
        <AccountStatusBadge status={account.status} />
      </div>
      <AccountBalance amount={balance} currency={account.currency} />
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="muted">{maskAccountId(account._id)}</span>
        <Link className="btn btn-secondary btn-sm" to={`/app/accounts/${account._id}`}>
          View account
        </Link>
      </div>
    </article>
  );
}
