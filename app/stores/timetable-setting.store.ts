import { defineStore } from 'pinia'

export const useTimetableSettingStore = defineStore('timetableSetting', {
    state: () => ({
        settings: { ...DEFAULT_TIMETABLE_SETTING } as TimetableSetting,
        loaded: false,
        loading: false
    }),

    actions: {
        // Idempotent: the download button on every timetable view calls this, so only the first one hits the API.
        async fetch(force = false) {
            if (this.loaded && !force) return

            this.loading = true
            try {
                const res = await TimetableSettingApi().get()
                if (!res) return

                Object.assign(this.settings, {
                    ...DEFAULT_TIMETABLE_SETTING,
                    ...res,
                    accentColor: res.accentColor || null,
                    footerNote: res.footerNote || ''
                })
                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        async save() {
            const res = await TimetableSettingApi().save(this.settings)
            if (res) this.loaded = true
            return res
        }
    }
})
