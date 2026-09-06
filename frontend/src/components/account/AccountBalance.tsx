import type { Currency } from "@/types";
import { formatMoney } from "@/utils/format";

export function AccountBalance({
  amount,
  currency,
  size = "lg",
}: {
  amount: number;
  currency: Currency;
  size?: "lg" | "md";
}) {
  return (
    <p className="amount account-balance" style={{ fontSize: size === "md" ? 24 : undefined }}>
      {formatMoney(amount, currency)}
    </p>
  );
}
