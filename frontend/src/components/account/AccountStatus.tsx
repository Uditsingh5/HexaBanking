import type { AccountStatus } from "@/types";
import { ACCOUNT_STATUS_COPY } from "@/constants";
import { Badge } from "@/components/ui/Badge";

const toneMap = {
  active: "success",
  frozen: "warning",
  closed: "danger",
} as const;

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return <Badge tone={toneMap[status]}>{ACCOUNT_STATUS_COPY[status].label}</Badge>;
}
