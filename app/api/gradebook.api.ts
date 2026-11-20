export const GradebookApi = () => {
  const { $api } = useNuxtApp()

  return {
    // termId defaults to the active term.
    get: async (classSessionId: string, termId?: string) => {
      try {
        const q = termId ? `?termId=${termId}` : ''
        const res = await $api(`/gradebook/session/${classSessionId}${q}`) as any
        return (res?.data ?? null) as Gradebook | null
      } catch (err: any) {
        useHandleError(err)
        return null
      }
    }
  }
}
