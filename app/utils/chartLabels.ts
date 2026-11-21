// Chart axis labels short enough to read on a phone.

/** "2026-W45" (an ISO week from the analytics API) -> "2 Nov", the Monday of that week. Other labels are unchanged. */
export function isoWeekLabel(label: string): string {
  const match = /^(\d{4})-W(\d{1,2})$/.exec(String(label))
  if (!match) return label
  const year = Number(match[1])
  const week = Number(match[2])
  // ISO week 1 is the week with 4 January in it.
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (week - 1) * 7)
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** x-axis options that keep labels level and spaced: at most `most` labels, the rest hidden instead of overlapping. */
export function spacedXAxis(categories: string[], most = 8) {
  return {
    categories,
    tickAmount: categories.length > most ? most : undefined,
    labels: { rotate: 0, hideOverlappingLabels: true, trim: true },
    axisTicks: { show: false }
  }
}
