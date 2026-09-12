import { defineStore } from 'pinia'

export const useMaterialSaleStore = defineStore('materialSale', {
  state: () => ({
    records: [] as MaterialSale[],
    summary: null as MaterialSaleSummary | null,
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6, search?: string, status?: string, paidPending?: boolean) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialSaleApi().getAll(page, size, search, status, paidPending) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch sales'
      } finally {
        this.loading = false
      }
    },
    async fetchSummary() {
      const response = await MaterialSaleApi().getSummary()
      this.summary = response || null
      return this.summary
    },
    create(payload: CreateMaterialSaleDto) {
      return MaterialSaleApi().create(payload)
    },
    async fulfill(id: string, note?: string) {
      const response = await MaterialSaleApi().fulfill(id, note) as any
      const index = this.records.findIndex(s => s.id === id)
      if (index !== -1) this.records[index] = response.data
      return response
    },
    async recordPayment(id: string, payload: RecordSalePaymentDto) {
      const response = await MaterialSaleApi().recordPayment(id, payload) as any
      const index = this.records.findIndex(s => s.id === id)
      if (index !== -1) this.records[index] = response.data
      return response
    },
    async cancel(id: string) {
      const response = await MaterialSaleApi().cancel(id) as any
      const index = this.records.findIndex(s => s.id === id)
      if (index !== -1) this.records[index] = response.data
      return response
    }
  }
})
