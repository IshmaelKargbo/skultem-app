<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="School Settings" subtitle="Manage your school's profile, contact details and academic preferences">
            <div class="flex gap-3">
                <UButton label="Restore Defaults" variant="outline" color="neutral" icon="lucide:rotate-ccw"
                    :disabled="saving" @click="restoreDefaults" />
                <UButton label="Save Settings" icon="lucide:save" :loading="saving" @click="save" />
            </div>
        </Heading>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <!-- Left Nav -->
            <aside class="space-y-4 lg:sticky lg:top-6">
                <UCard :ui="{ body: 'p-2' }">
                    <nav class="space-y-1">
                        <button v-for="item in sections" :key="item.key" type="button"
                            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
                            :class="active === item.key ? 'bg-primary text-inverted font-medium' : 'text-toned hover:bg-muted/50'"
                            @click="active = item.key">
                            <UIcon :name="item.icon" class="size-4 shrink-0" />
                            <span class="flex-1">{{ item.label }}</span>
                            <UBadge v-if="item.soon" label="Soon" size="xs" variant="subtle" color="neutral" />
                        </button>
                    </nav>
                </UCard>

                <UCard :ui="{ body: 'p-2' }">
                    <p class="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        External Channels
                    </p>
                    <div class="space-y-1">
                        <div v-for="channel in channels" :key="channel.label"
                            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                            :class="channel.to ? 'text-toned hover:bg-muted/50 cursor-pointer' : 'text-muted cursor-not-allowed opacity-70'"
                            @click="channel.to && navigateTo(channel.to)">
                            <UIcon :name="channel.icon" class="size-4 shrink-0" />
                            <span class="flex-1">{{ channel.label }}</span>
                            <UIcon v-if="channel.to" name="lucide:arrow-up-right" class="size-3.5 shrink-0" />
                            <UBadge v-else label="Soon" size="xs" variant="subtle" color="neutral" />
                        </div>
                    </div>
                </UCard>

                <UCard :ui="{ body: 'p-4' }" class="bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20">
                    <div class="flex items-center gap-2 text-primary">
                        <UIcon name="lucide:book-open" class="size-4" />
                        <p class="text-sm font-semibold">Quick Guide</p>
                    </div>
                    <ul class="mt-2.5 space-y-2 text-xs text-toned">
                        <li><span class="font-medium">Short name:</span> used on report cards and SMS templates where space is limited.</li>
                        <li><span class="font-medium">Images:</span> use square, transparent PNGs for the logo and favicon.</li>
                        <li><span class="font-medium">Signature:</span> stamped on generated report cards and ID cards.</li>
                    </ul>
                </UCard>
            </aside>

            <!-- Right Content -->
            <div class="space-y-4 min-w-0">
                <template v-if="active === 'profile'">
                    <SectionHeader icon="lucide:info" label="General Information" />
                    <UCard>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <UFormField required label="School Name">
                                <UInput v-model="state.name" placeholder="e.g. King's Way International School" class="w-full" />
                            </UFormField>

                            <UFormField label="Short Name / Acronym">
                                <UInput v-model="state.shortName" placeholder="e.g. KWIS" class="w-full" />
                            </UFormField>

                            <UFormField required label="School Email">
                                <UInput v-model="state.email" :icon="EMAIL_ICON" placeholder="e.g. info@school.edu" class="w-full" />
                            </UFormField>

                            <UFormField label="Phone Number">
                                <UInput v-model="state.phone" :icon="PHONE_ICON" placeholder="e.g. +232 76 000 000" class="w-full" />
                            </UFormField>

                            <UFormField label="Principal Name">
                                <UInput v-model="state.principalName" placeholder="e.g. Dr. A. Conteh" class="w-full" />
                            </UFormField>

                            <UFormField label="Country">
                                <USelectMenu v-model="state.country" value-key="value" :items="countries" class="w-full" />
                            </UFormField>

                            <UFormField label="Established Year">
                                <UInput v-model="state.establishedYear" placeholder="e.g. 1998" class="w-full" />
                            </UFormField>

                            <UFormField label="Registration No.">
                                <UInput v-model="state.registrationNo" placeholder="e.g. MOE-SL-2004-0192" class="w-full" />
                            </UFormField>
                        </div>

                        <UFormField label="Address" class="mt-4">
                            <UTextarea v-model="state.address" :rows="2" placeholder="Street, city, country" class="w-full" />
                        </UFormField>
                    </UCard>

                    <SectionHeader icon="lucide:palette" label="Branding & Appearance" />
                    <UCard>
                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <UploadTile label="School Logo" hint="Square PNG" :src="state.logo"
                                @select="(f) => onImageChange('logo', f)" @clear="state.logo = ''" />
                            <UploadTile label="Favicon" hint=".ico or .png" :src="state.favicon"
                                @select="(f) => onImageChange('favicon', f)" @clear="state.favicon = ''" />
                            <UploadTile label="Principal Signature" hint="Transparent PNG" :src="state.signature"
                                muted @select="(f) => onImageChange('signature', f)" @clear="state.signature = ''" />
                        </div>
                    </UCard>
                </template>

                <template v-else-if="active === 'formats'">
                    <SectionHeader icon="lucide:sliders-horizontal" label="System & Formats" />
                    <UCard>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <UFormField label="Academic Year Starts">
                                <UInput v-model="state.academicYearStart" type="date" class="w-full" />
                            </UFormField>

                            <UFormField label="Academic Year Ends">
                                <UInput v-model="state.academicYearEnd" type="date" class="w-full" />
                            </UFormField>

                            <UFormField label="Language">
                                <USelectMenu v-model="state.language" value-key="value" :items="languages" class="w-full" />
                            </UFormField>

                            <UFormField label="Timezone">
                                <USelectMenu v-model="state.timezone" value-key="value" :items="timezones" class="w-full" />
                            </UFormField>

                            <UFormField label="Currency" class="sm:col-span-2 lg:col-span-1">
                                <USelectMenu v-model="state.currency" value-key="value" :items="currencies" class="w-full" />
                                <template #help>
                                    <p class="text-xs text-muted">Preview only — fee amounts are formatted in NLE app-wide for now.</p>
                                </template>
                            </UFormField>
                        </div>
                    </UCard>
                </template>

                <template v-else>
                    <SectionHeader :icon="comingSoon.icon" :label="comingSoon.label" />
                    <UCard>
                        <div class="flex flex-col items-center gap-2 py-14 text-center">
                            <UIcon :name="comingSoon.icon" class="text-4xl text-muted" />
                            <p class="text-sm font-medium text-highlighted">{{ comingSoon.label }} settings are coming soon</p>
                            <p class="max-w-xs text-xs text-muted">{{ comingSoon.description }}</p>
                        </div>
                    </UCard>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'school:settings'
const { success } = useNotify()

type SchoolSettings = {
    logo: string
    favicon: string
    signature: string
    name: string
    shortName: string
    establishedYear: string
    registrationNo: string
    email: string
    phone: string
    principalName: string
    address: string
    country: string
    academicYearStart: string
    academicYearEnd: string
    language: string
    timezone: string
    currency: string
}

const defaultSettings: SchoolSettings = {
    logo: '',
    favicon: '',
    signature: '',
    name: "King's Way International School",
    shortName: 'KWIS',
    establishedYear: '1998',
    registrationNo: 'MOE-SL-2004-0192',
    email: 'info@kingsway.edu.sl',
    phone: '+232 76 000 000',
    principalName: 'Dr. A. Conteh',
    address: '12 Wilkinson Road, Freetown, Sierra Leone',
    country: 'Sierra Leone',
    academicYearStart: '2025-09-01',
    academicYearEnd: '2026-07-31',
    language: 'English',
    timezone: 'Africa/Freetown',
    currency: 'NLE'
}

const state = reactive<SchoolSettings>({ ...defaultSettings })
const saving = ref(false)

const sections = [
    { key: 'profile', label: 'School Profile', icon: SCHOOL_ICON },
    { key: 'formats', label: 'System & Formats', icon: 'lucide:sliders-horizontal' },
    { key: 'attendance', label: 'Attendance', icon: ATTENDANCE_ICON, soon: true },
    { key: 'security', label: 'Security', icon: 'lucide:shield', soon: true },
    { key: 'integrations', label: 'Integrations', icon: 'lucide:plug', soon: true }
]

const active = ref(sections[0]!.key)

const comingSoonCopy: Record<string, { label: string, icon: string, description: string }> = {
    attendance: { label: 'Attendance', icon: ATTENDANCE_ICON, description: 'Default attendance windows and lateness thresholds will be configurable here.' },
    security: { label: 'Security', icon: 'lucide:shield', description: 'Password policy and session controls will live here.' },
    integrations: { label: 'Integrations', icon: 'lucide:plug', description: 'Connect third-party tools and services from here.' }
}

const comingSoon = computed(() => comingSoonCopy[active.value] ?? comingSoonCopy.attendance!)

const channels = [
    { label: 'Social Media', icon: 'lucide:share-2' },
    { label: 'Telegram Bot', icon: 'lucide:send' },
    { label: 'Notifications', icon: BELL_ICON, to: '/notifications' }
]

const countries = [
    { label: 'Sierra Leone (+232)', value: 'Sierra Leone' },
    { label: 'Liberia (+231)', value: 'Liberia' },
    { label: 'Ghana (+233)', value: 'Ghana' },
    { label: 'Nigeria (+234)', value: 'Nigeria' },
    { label: 'Guinea (+224)', value: 'Guinea' },
    { label: 'Gambia (+220)', value: 'Gambia' }
]

const languages = [
    { label: 'English', value: 'English' },
    { label: 'French', value: 'French' }
]

const timezones = [
    { label: 'Africa/Freetown (GMT)', value: 'Africa/Freetown' },
    { label: 'Africa/Accra (GMT)', value: 'Africa/Accra' },
    { label: 'Africa/Lagos (WAT)', value: 'Africa/Lagos' },
    { label: 'UTC', value: 'UTC' }
]

const currencies = [
    { label: 'NLE - Sierra Leonean Leone', value: 'NLE' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'GHS - Ghanaian Cedi', value: 'GHS' }
]

function onImageChange(key: 'logo' | 'favicon' | 'signature', file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
        state[key] = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

function save() {
    saving.value = true
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        success('School settings saved on this device')
    } finally {
        saving.value = false
    }
}

function restoreDefaults() {
    Object.assign(state, defaultSettings)
    localStorage.removeItem(STORAGE_KEY)
}

onMounted(() => {
    useAppStore().setTitle('Settings')
    document.title = 'School Settings | Skultem'

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            Object.assign(state, JSON.parse(saved))
        } catch {
            // ignore malformed local data
        }
    }
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
