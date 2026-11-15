// Weekly plans: a class section's school term as weeks, a few subjects each school day (see WeeklyPlanService).
export type WeeklyPlanSlot = { name: string, start: string, end: string }
export type WeeklyPlanEntry = { slot: number, subjectId: string, subjectName: string }
export type WeeklyPlanDay = { date: string, weekday: string, holiday: string | null, entries: WeeklyPlanEntry[] }
export type WeeklyPlanWeek = { label: string, start: string, end: string, days: WeeklyPlanDay[] }
export type WeeklyPlan = {
  id: string | null, classSessionId: string, className: string, termId: string, termName: string
  termStart: string, termEnd: string, status: 'DRAFT' | 'PUBLISHED'
  slots: WeeklyPlanSlot[], slotsSource: 'CLASS' | 'SCHOOL', subjects: { id: string, name: string }[], weeks: WeeklyPlanWeek[]
}
export type ClassSlots = { slots: WeeklyPlanSlot[], source: 'CLASS' | 'SCHOOL' }
export type ChildWeeklyPlan = { className: string, slots: WeeklyPlanSlot[], weeks: WeeklyPlanWeek[] }

export const WeeklyPlanApi = () => {
  const { $api } = useNuxtApp()
  const q = (classSessionId: string, termId: string) => `classSessionId=${encodeURIComponent(classSessionId)}&termId=${encodeURIComponent(termId)}`

  return {
    slots: async (): Promise<WeeklyPlanSlot[]> => ((await $api('/weekly-plans/slots')) as any).data,
    saveSlots: async (slots: WeeklyPlanSlot[]): Promise<WeeklyPlanSlot[]> =>
      ((await $api('/weekly-plans/slots', { method: 'PUT', body: { slots } })) as any).data,
    classSlots: async (classSessionId: string): Promise<ClassSlots> =>
      ((await $api(`/weekly-plans/slots/class?classSessionId=${encodeURIComponent(classSessionId)}`)) as any).data,
    saveClassSlots: async (classSessionId: string, slots: WeeklyPlanSlot[]): Promise<ClassSlots> =>
      ((await $api(`/weekly-plans/slots/class?classSessionId=${encodeURIComponent(classSessionId)}`, { method: 'PUT', body: { slots } })) as any).data,
    clearClassSlots: async (classSessionId: string): Promise<ClassSlots> =>
      ((await $api(`/weekly-plans/slots/class?classSessionId=${encodeURIComponent(classSessionId)}`, { method: 'DELETE' })) as any).data,
    get: async (classSessionId: string, termId: string): Promise<WeeklyPlan> =>
      ((await $api(`/weekly-plans?${q(classSessionId, termId)}`)) as any).data,
    autoFill: async (classSessionId: string, termId: string): Promise<WeeklyPlan> =>
      ((await $api(`/weekly-plans/auto-fill?${q(classSessionId, termId)}`, { method: 'POST' })) as any).data,
    save: async (classSessionId: string, termId: string, entries: { date: string, slot: number, subjectId: string }[]): Promise<WeeklyPlan> =>
      ((await $api(`/weekly-plans?${q(classSessionId, termId)}`, { method: 'PUT', body: { entries } })) as any).data,
    setStatus: async (classSessionId: string, termId: string, published: boolean): Promise<WeeklyPlan> =>
      ((await $api(`/weekly-plans/status?${q(classSessionId, termId)}`, { method: 'PATCH', body: { published } })) as any).data,
    child: async (studentId: string): Promise<ChildWeeklyPlan | null> =>
      ((await $api(`/weekly-plans/child/${encodeURIComponent(studentId)}`)) as any).data ?? null
  }
}

// "13:30" -> "1:30 PM"
export function ampm(t?: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number) as [number, number]
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export function slotTime(s: WeeklyPlanSlot) {
  return s.start && s.end ? `${ampm(s.start)} - ${ampm(s.end)}` : s.start ? ampm(s.start) : ''
}
