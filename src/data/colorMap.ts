export type Status = "good" | "caution" | "issue" | "future"

export const statusColors: Record<Status, string> = {
  good: "hsl(var(--status-good))",
  caution: "hsl(var(--status-caution))",
  issue: "hsl(var(--status-issue))",
  future: "hsl(var(--status-future))",
}

export const statusHoverColors: Record<Status, string> = {
  good: "hsl(var(--status-good-light))",
  caution: "hsl(var(--status-caution-light))",
  issue: "hsl(var(--status-issue-light))",
  future: "hsl(var(--status-future))",
}