import { defineStore } from 'pinia'

export const useAcademicYearStore = defineStore('academic-year', {
  state: () => ({
    records: [] as AcademicYear[],
    meta: {} as Meta,
    loading: false,
    terms: [] as Term[],
    error: null as string | null,
    // Which year the header's switcher is currently pointed at. Null means "follow the active
    // year". Persisted to a cookie (not just in-memory) so it survives the full-page reload that
    // setViewingYear triggers below - without that, the reload would immediately forget the pick
    // and snap back to the active year.
    viewingYearId: useCookie<string | null>('viewing_academic_year_id').value ?? null as string | null
  }),
  actions: {
    setViewingYear(id: string | null) {
      // Compare against what's actually showing (falls back to the active year, same as the
      // `viewingYear` getter below) rather than the raw, possibly-still-null state - otherwise
      // re-picking the year that's already displayed looks like a change and triggers a reload.
      const current = this.viewingYearId ?? this.records.find((record) => record.active)?.id ?? null
      if (id === current) return

      this.viewingYearId = id
      const cookie = useCookie<string | null>('viewing_academic_year_id')
      cookie.value = id

      // Most pages fetch their data imperatively on mount rather than through a reactive
      // useAsyncData, so there's no single hook to re-trigger everywhere the switch should be
      // felt. A full reload is the blunt but reliable way to make "every page" actually mean
      // every page - the freshly booted app re-runs every mounted fetch, this time picking up
      // the cookie above via the api plugin's automatic academicYearId injection.
      //
      // The cookie write above is reactive, not synchronous - reloading in the very same tick
      // could race ahead of it and carry the OLD cookie value into the fresh boot (symptom: the
      // switch silently "doesn't take" and needs a couple of manual refreshes before it sticks).
      // Waiting a tick guarantees the write has actually landed in document.cookie first.
      if (import.meta.client) {
        nextTick(() => window.location.reload())
      }
    },
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await AcademicYearApi().getAll(page, size)
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch academic years'
      } finally {
        this.loading = false
      }
    },
    findOne(id: string) {
      return AcademicYearApi().getOne(id)
    },
    async getTerms() {
      const res = await AcademicYearApi().getTerms() as Term[]
      this.terms = res || [];
    },
    create(payload: CreateAcademicYearDto) {
      return AcademicYearApi().create(payload)
    },
    async configureNext(id: string, payload: ConfigureNextAcademicYearDto) {
      const res = await AcademicYearApi().configureNext(id, payload)
      if (res) await this.fetchAll()
      return res
    },
    async assignNext(id: string, nextYearId: string) {
      const res = await AcademicYearApi().assignNext(id, nextYearId)
      if (res) await this.fetchAll()
      return res
    },
    async update(id: string, payload: CreateAcademicYearDto) {
      const response = await AcademicYearApi().update(id, payload)
      const index = this.records.findIndex((r) => r.id === id)
      if (index !== -1) this.records[index] = response
      return response
    },
    async remove(id: string) {
      await AcademicYearApi().remove(id)
      this.records = this.records.filter((r) => r.id !== id)
    }
  },
  getters: {
    isEmpty: (state) => state.records.length === 0,
    hasError: (state) => !!state.error,
    activeYear: (state) => state.records.find((record) => record.active),
    // What the header's switcher shows: the explicitly picked year, falling back to whichever
    // year is actually active.
    viewingYear: (state) =>
      state.records.find((record) => record.id === state.viewingYearId)
      ?? state.records.find((record) => record.active),
    // Years that could still be assigned as someone's next year: not already linked to as another
    // year's next, and not the year currently being configured (checked by the caller).
    unassignedYears: (state) => state.records.filter((record) =>
      !state.records.some((other) => other.nextYearId === record.id)
    ),
    list: (state) => state.records.map((record) => ({
      value: record.id,
      label: record.name,
    })),
    termList: (state) => {
      return state.terms.map(e => ({ label: e.name, value: e.id }))
    },
    getTerm: (state) => {
      return (id: string): Term | undefined => {
        return state.terms.find(e => e.id == id)
      }
    },
  },
})
