// The single place an assessment score or average is rounded for display. Schools choose in
// School Settings > Grades & Scores whether scores show as whole numbers (26.7 -> 27) or keep one
// decimal place (26.7). Rounding stays on until a school turns it off.
export function useScoreFormat() {
  const { school, hydrateFromCache } = useSchoolInfo()
  hydrateFromCache()

  const roundScores = computed(() => school.value?.roundAssessmentScores ?? true)

  // A number ready to show or compare: whole when rounding is on, otherwise one decimal place.
  function scoreValue(value: number): number {
    return roundScores.value ? Math.round(value) : Math.round(value * 10) / 10
  }

  // The score as text, e.g. "27" or "26.7" ("27.0" is shown as "27").
  function formatScore(value: number | null | undefined, fallback = '-'): string {
    if (value == null || !Number.isFinite(Number(value))) return fallback
    return String(scoreValue(Number(value)))
  }

  return { roundScores, scoreValue, formatScore }
}
