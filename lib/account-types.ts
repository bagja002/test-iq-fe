import type { AccountType } from "@iq/openapi"

export function hasPaidAccess(accountType: AccountType): boolean {
  return accountType !== "FREE"
}

export function getAccountBadgeLabel(accountType: AccountType): string {
  switch (accountType) {
    case "PRO":
      return "PRO"
    case "MAX":
      return "MAX"
    default:
      return "FREE"
  }
}
