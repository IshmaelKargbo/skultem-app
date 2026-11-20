// Follow-ups on students flagged as needing attention (backend: StudentFollowUpController). The class's class
// master and subject teachers read and record them; management always can.
export const FollowUpApi = () => {
  const { $api } = useNuxtApp()

  return {
    listForClass: async (classId: string) => {
      try {
        const res = await $api(`/student-follow-up/class/${classId}`) as any
        return (res?.data ?? []) as FollowUp[]
      } catch (err: any) {
        useHandleError(err)
        return [] as FollowUp[]
      }
    },
    record: async (classId: string, body: { studentId: string, action: FollowUpAction, note?: string | null, resolved: boolean }) => {
      // Errors go back to the caller, which keeps the form open and says what was wrong.
      const res = await $api(`/student-follow-up/class/${classId}`, { method: 'POST', body }) as any
      return res?.data as FollowUp
    }
  }
}
