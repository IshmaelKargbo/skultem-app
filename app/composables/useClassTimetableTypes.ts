// Each class's timetable type, loaded once and shared: the Timetable page lists the classes on the normal
// timetable, the Weekly plan page the ones on the weekly plan, and Timetable settings switches them.
export function useClassTimetableTypes() {
  const types = useState<ClassTimetableType[] | null>('class-timetable-types', () => null)
  const loading = useState('class-timetable-types-loading', () => false)

  async function load(force = false) {
    if (types.value && !force) return types.value
    loading.value = true
    try {
      types.value = await ClassTimetableTypeApi().list()
    } catch {
      // Can't tell (e.g. a server before the update): every class counts as on the normal timetable, so the pages
      // still work.
      types.value = types.value ?? []
    } finally {
      loading.value = false
    }
    return types.value
  }

  // A class with no choice runs on the normal timetable.
  const typeOf = (classId?: string | null): ClassTimetableKind =>
    types.value?.find((t) => t.classId === classId)?.type ?? 'PERIODS'
  const isWeeklyPlan = (classId?: string | null) => typeOf(classId) === 'WEEKLY_PLAN'
  // The same, from one of the class's sections (what most pickers hold).
  const typeOfSession = (sessionId?: string | null): ClassTimetableKind =>
    types.value?.find((t) => !!sessionId && t.sessionIds?.includes(sessionId))?.type ?? 'PERIODS'

  const classIdOfSession = (sessionId?: string | null) =>
    types.value?.find((t) => !!sessionId && t.sessionIds?.includes(sessionId))?.classId ?? null

  // The class picked on the Timetable pages (a class section), shared by the Timetable and Weekly plan pages and
  // their tab bar: the tab bar shows the page the class runs on, and picking a class opens that page.
  const selected = useState<string>('timetable-selected-session', () => '')
  const pageFor = (sessionId?: string | null) =>
    typeOfSession(sessionId) === 'WEEKLY_PLAN' ? '/timetable/weekly-plan' : '/timetable'

  async function set(classId: string, type: ClassTimetableKind) {
    const saved = await ClassTimetableTypeApi().set(classId, type)
    types.value = (types.value ?? []).some((t) => t.classId === classId)
      ? types.value!.map((t) => (t.classId === classId ? saved : t))
      : [...(types.value ?? []), saved]
    return saved
  }

  return { types, loading, load, typeOf, isWeeklyPlan, typeOfSession, classIdOfSession, selected, pageFor, set }
}
