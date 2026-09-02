import { defineStore } from 'pinia'

const DEFAULT_SETTINGS: PayslipSetting = {
    accentColor: '#4338ca',
    logoUrl: '',
    footerNote: '',
    showWatermark: true,
    showAmountInWords: true
}

export const usePayslipSettingStore = defineStore('payslipSetting', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS },
        loaded: false,
        loading: false
    }),

    actions: {
        async fetch() {
            this.loading = true
            try {
                const res = await PayslipSettingApi().get()
                if (!res) return

                Object.assign(this.settings, {
                    accentColor: res.accentColor || DEFAULT_SETTINGS.accentColor,
                    logoUrl: res.logoUrl || '',
                    footerNote: res.footerNote || '',
                    showWatermark: res.showWatermark,
                    showAmountInWords: res.showAmountInWords
                })

                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        async save() {
            return await PayslipSettingApi().save(this.settings)
        }
    }
})
