// Which timetable each class runs on: the normal one (periods each day) or the weekly plan - never both
// (see ClassTimetableTypeService).
export type ClassTimetableKind = 'PERIODS' | 'WEEKLY_PLAN'
export type ClassTimetableType = {
  classId: string, className: string, type: ClassTimetableKind
  // What each would show: lessons on the normal timetable, a weekly plan (kept, hidden, while the class is on the other).
  hasTimetable: boolean, hasWeeklyPlan: boolean
  // The class's sections, so a screen that only knows a section can tell its type.
  sessionIds: string[]
}

export const ClassTimetableTypeApi = () => {
  const { $api } = useNuxtApp()
  return {
    list: async (): Promise<ClassTimetableType[]> => ((await $api('/timetable/class-types')) as any).data ?? [],
    set: async (classId: string, type: ClassTimetableKind): Promise<ClassTimetableType> =>
      ((await $api(`/timetable/class-types/${encodeURIComponent(classId)}`, { method: 'PUT', body: { type } })) as any).data,
  }
}
