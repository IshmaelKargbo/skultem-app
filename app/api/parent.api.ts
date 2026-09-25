export const ParentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/parent?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch parents')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudent: async (page: number, size: number) => {
      try {
        const res = await $api(`/parent/students?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch parent students')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateParentDto) => {
      try {
        return await $api('/parent', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    edit: async (id: string, payload: EditParentDto) => {
      try {
        const res = await $api(`/parent/${id}`, { method: 'PATCH', body: payload }) as any
        return res.data as Parent
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Irreversible - owner-level only, and refused while a student still has this parent as their
    // guardian. The guardian's full name is the typed confirmation.
    deletePermanently: async (id: string, confirmation: string) => {
      try {
        const res = await $api(`/parent/${id}/delete-permanently`, {
          method: 'POST',
          body: { confirmation }
        }) as any
        return res.data as { parentName: string, otherStudentLinksRemoved: number, account: string }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    addEmail: async (id: string, email: string) => {
      try {
        return await $api(`/parent/${id}/email`, {
          method: 'PATCH',
          body: { email }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
