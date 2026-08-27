import { defineStore } from 'pinia'

export interface IdCardField {
    key: string
    label: string
    icon: string
    cardSlot: 'front' | 'back'
    enabled: boolean
    required?: boolean
}

export interface IdCardVisualSettings {
    layout: 'vertical' | 'horizontal'
    profileShape: 'round' | 'square'
    headerColor: string
    footerColor: string
    headerTextColor: string
    primaryTextColor: string
    widthMm: number
    heightMm: number
    bgImageUrl: string
    bgOpacity: number
    schoolName: string
    schoolAddress: string
    principalName: string
    validityYears: number
}

const DEFAULT_SETTINGS: IdCardVisualSettings = {
    layout: 'vertical',
    profileShape: 'square',
    headerColor: '#1878c5',
    footerColor: '#1878c5',
    headerTextColor: '#ffffff',
    primaryTextColor: '#111827',
    widthMm: 85,
    heightMm: 54,
    bgImageUrl: '',
    bgOpacity: 20,
    schoolName: '',
    schoolAddress: '',
    principalName: '',
    validityYears: 1
}

export const useIdCardStore = defineStore('idCard', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS },
        fields: [] as IdCardField[],
        loaded: false,
        loading: false
    }),

    actions: {
        async fetch() {
            this.loading = true
            try {
                const res = await IdCardSettingApi().get()
                if (!res) return

                Object.assign(this.settings, {
                    layout: res.layout,
                    profileShape: res.profileShape,
                    headerColor: res.headerColor,
                    footerColor: res.footerColor,
                    headerTextColor: res.headerTextColor,
                    primaryTextColor: res.primaryTextColor,
                    widthMm: res.widthMm,
                    heightMm: res.heightMm,
                    bgImageUrl: res.bgImageUrl || '',
                    bgOpacity: res.bgOpacity,
                    schoolName: res.schoolName || '',
                    schoolAddress: res.schoolAddress || '',
                    principalName: res.principalName || '',
                    validityYears: res.validityYears || 1
                })

                try {
                    this.fields = JSON.parse(res.fields) || []
                } catch {
                    this.fields = []
                }

                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        async save() {
            const payload = { ...this.settings, fields: JSON.stringify(this.fields) }
            const res = await IdCardSettingApi().save(payload)
            return res
        }
    }
})
