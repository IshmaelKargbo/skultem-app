import { defineStore } from 'pinia'

export interface ReportCardSettings {
    headerColor: string
    logoUrl: string
    footerNote: string
    showAttendance: boolean
    showRemarks: boolean
    showPosition: boolean
    showTeacherSignature: boolean
    showPrincipalSignature: boolean
    showGradeScale: boolean
    remarkScale: RemarkBand[]
}

// Scores from minScore to maxScore (inclusive) get this ready-made remark on the report card.
export interface RemarkBand {
    minScore: number
    maxScore: number
    remark: string
}

const DEFAULT_SETTINGS: ReportCardSettings = {
    headerColor: '#1878c5',
    logoUrl: '',
    footerNote: '',
    showAttendance: true,
    showRemarks: true,
    showPosition: true,
    showTeacherSignature: true,
    showPrincipalSignature: true,
    showGradeScale: true,
    remarkScale: []
}

export const useReportCardSettingStore = defineStore('reportCardSetting', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS, remarkScale: [] as RemarkBand[] },
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
                    showTeacherSignature: res.showTeacherSignature ?? res.showSignatures,
                    showPrincipalSignature: res.showPrincipalSignature ?? res.showSignatures,
                    showGradeScale: res.showGradeScale,
                    remarkScale: res.remarkScale ?? []
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
