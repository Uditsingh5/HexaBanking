import type { TransactionStatus } from "@/types";
import { TRANSACTION_STATUS_COPY } from "@/constants";
import { Badge } from "@/components/ui/Badge";

const toneMap = {
  pending: "pending",
  completed: "success",
  failed: "danger",
  reversed: "reversed",
} as const;

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge tone={toneMap[status]}>{TRANSACTION_STATUS_COPY[status].label}</Badge>;
}
