import { defineStore } from 'pinia'

export interface ReportCardSettings {
    headerColor: string
    logoUrl: string
    footerNote: string
    showAttendance: boolean
    showRemarks: boolean
    showPosition: boolean
    showSignatures: boolean
    showGradeScale: boolean
}

const DEFAULT_SETTINGS: ReportCardSettings = {
    headerColor: '#1878c5',
    logoUrl: '',
    footerNote: '',
    showAttendance: true,
    showRemarks: true,
    showPosition: true,
    showSignatures: true,
    showGradeScale: true
}

export const useReportCardSettingStore = defineStore('reportCardSetting', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS },
        loaded: false,
        loading: false
    }),

    actions: {
        async fetch() {
            this.loading = true
            try {
                const res = await ReportCardSettingApi().get()
                if (!res) return

                Object.assign(this.settings, {
                    headerColor: res.headerColor || DEFAULT_SETTINGS.headerColor,
                    logoUrl: res.logoUrl || '',
                    footerNote: res.footerNote || '',
                    showAttendance: res.showAttendance,
                    showRemarks: res.showRemarks,
                    showPosition: res.showPosition,
                    showSignatures: res.showSignatures,
                    showGradeScale: res.showGradeScale
                })

                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        async save() {
            return await ReportCardSettingApi().save(this.settings)
        }
    }
})
