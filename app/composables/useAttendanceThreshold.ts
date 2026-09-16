// The single frontend place a percentage gets compared against the school's configured attendance
// alert threshold (School Settings > Attendance > "Minimum Attendance %", backend-persisted, no
// fixed 75 anywhere in the app) - Monthly Summary, Term Summary and Inspection Reports all import
// this instead of re-typing the literal 75.
const FALLBACK_THRESHOLD = 75

export function useAttendanceThreshold() {
  const { school, hydrateFromCache } = useSchoolInfo()
  hydrateFromCache()

  const threshold = computed(() => school.value?.attendanceThreshold ?? FALLBACK_THRESHOLD)

  function isBelowAttendanceThreshold(percentage: number | null | undefined): boolean {
    return percentage != null && percentage < threshold.value
  }

  return { threshold, isBelowAttendanceThreshold }
}
