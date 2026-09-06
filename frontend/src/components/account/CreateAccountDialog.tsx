import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { CURRENCIES } from "@/constants";
import { useAccountStore } from "@/stores/account.store";
import { useNotificationStore } from "@/stores/notification.store";
import { getErrorMessage } from "@/lib/errors";
import type { Currency } from "@/types";
import { currencySymbol } from "@/utils/format";

interface CreateAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountDialog({ open, onClose }: CreateAccountDialogProps) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [error, setError] = useState<string | null>(null);
  const isCreating = useAccountStore((state) => state.isCreating);
  const createAccount = useAccountStore((state) => state.createAccount);
  const notify = useNotificationStore((state) => state.notify);

  async function handleCreate() {
    setError(null);
    try {
      await createAccount(currency);
      notify({
        tone: "success",
        title: "Account created successfully.",
        description: `A new ${currency} account is ready to use.`,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "The account could not be created."));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create an account"
      description="Choose a currency. Accounts are not interchangeable — ₹500 is not $500."
    >
      <div className="grid grid-3" style={{ margin: "16px 0 20px" }}>
        {CURRENCIES.map((item) => (
          <button
            key={item}
            type="button"
            className="currency-option"
            aria-pressed={currency === item}
            onClick={() => setCurrency(item)}
          >
            <strong>
              {currencySymbol(item)} {item}
            </strong>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
              {item} ledger
            </p>
          </button>
        ))}
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleCreate} loading={isCreating}>
          Create account
        </Button>
      </div>
    </Dialog>
  );
}
