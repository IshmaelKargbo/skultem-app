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

const DEFAULT_STAFF_FIELDS: IdCardField[] = [
    { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
    { key: 'staffId', label: 'Staff ID', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
    { key: 'designation', label: 'Position', icon: 'i-lucide-briefcase', cardSlot: 'front', enabled: true },
    { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: true },
    { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
    { key: 'phone', label: 'Phone', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true }
]

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
        staffFields: [] as IdCardField[],
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

                try {
                    this.staffFields = JSON.parse(res.staffFields) || []
                } catch {
                    this.staffFields = []
                }
                // A school this old server doesn't know staffFields for yet would otherwise show
                // an empty "Fields (Staff)" list - fall back to the same defaults the backend uses
                // for a brand-new school, rather than an empty editor.
                if (!this.staffFields.length) {
                    this.staffFields = DEFAULT_STAFF_FIELDS.map(f => ({ ...f }))
                }

                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        async save() {
            const payload = { ...this.settings, fields: JSON.stringify(this.fields), staffFields: JSON.stringify(this.staffFields) }
            const res = await IdCardSettingApi().save(payload)
            return res
        }
    }
})
