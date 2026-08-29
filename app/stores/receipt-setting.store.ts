import { defineStore } from 'pinia'

const DEFAULT_SETTINGS: ReceiptSetting = {
    accentColor: '#4338ca',
    logoUrl: '',
    footerNote: '',
    showWatermark: true,
    showAmountInWords: true
}

export const useReceiptSettingStore = defineStore('receiptSetting', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS },
        loaded: false,
        loading: false
    }),

    actions: {
        async fetch() {
            this.loading = true
            try {
                const res = await ReceiptSettingApi().get()
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
            return await ReceiptSettingApi().save(this.settings)
        }
    }
})
