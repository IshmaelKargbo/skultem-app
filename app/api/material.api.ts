export const MaterialApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAllCategories: async (page: number, size: number, search?: string) => {
      try {
        const query = search ? `&search=${encodeURIComponent(search)}` : ''
        const res = await $api(`/materials/category?page=${page}&size=${size}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch material categories')

        const data = res.data
        
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllSupply: async (page: number, size: number, search?: string) => {
      try {
        const query = search ? `&search=${encodeURIComponent(search)}` : ''
        const res = await $api(`/materials/supply?page=${page}&size=${size}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch material supplies')

        const data = res.data
        
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAll: async (page: number, size: number, search?: string) => {
      try {
        const query = search ? `&search=${encodeURIComponent(search)}` : ''
        const res = await $api(`/materials?page=${page}&size=${size}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch materials')

        const data = res.data
        
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    createCategory: async (payload: CreateMaterialCategoryDto) => {
      try {
        return await $api('/materials/category', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateCategory: async (id: string, payload: CreateMaterialCategoryDto) => {
      try {
        const res = await $api(`/materials/category/${id}`, {
          method: 'PUT',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    deleteCategory: async (id: string) => {
      try {
        return await $api(`/materials/category/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateMaterialDto) => {
      try {
        return await $api('/materials', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    update: async (id: string, payload: CreateMaterialDto) => {
      try {
        const res = await $api(`/materials/${id}`, {
          method: 'PUT',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    delete: async (id: string) => {
      try {
        return await $api(`/materials/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    restock: async (payload: RestockDto) => {
      try {
        return await $api('/materials/restock', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    supply: async (payload: SupplyDto) => {
      try {
        return await $api('/materials/supply', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
