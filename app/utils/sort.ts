// Highest first, for ranking-style report tables (attendance %, average score, ...). A missing value
// (null/undefined - e.g. a student with no recorded days) sorts last, and ties keep the order they came in
// (the backend's name order), so equal rows don't jump around.
export function sortByDesc<T>(rows: readonly T[] | null | undefined, value: (row: T) => number | null | undefined): T[] {
    const key = (row: T) => value(row) ?? Number.NEGATIVE_INFINITY
    return [...(rows ?? [])].sort((a, b) => key(b) - key(a))
}
