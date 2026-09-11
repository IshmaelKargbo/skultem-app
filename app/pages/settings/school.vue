<template>
    <div class="px-4 md:px-6 space-y-4">
        <Heading class="hidden md:block" title="School Settings"
            subtitle="Manage your school's profile, contact details and academic preferences">
            <!-- Hidden below lg - on mobile the same actions live in the drawer's footer instead,
                 next to the section they actually apply to (see the USlideover below). -->
            <div class="hidden gap-3 lg:flex">
                <UButton v-if="active === 'profile'" label="Save Settings" icon="lucide:save" :loading="saving"
                    :disabled="loading" @click="save" />
                <UButton v-else-if="active === 'attendance'" label="Save Location" icon="lucide:save"
                    :loading="savingLocation" :disabled="loadingLocation" @click="saveAttendanceLocation" />
            </div>
        </Heading>

        <div v-if="loading" class="flex justify-center py-20">
            <USkeleton class="h-64 w-full max-w-3xl rounded-2xl" />
        </div>

        <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <!-- Left Nav -->
            <aside class="space-y-4 lg:sticky lg:top-6">
                <UCard :ui="{ body: 'p-2' }">
                    <nav class="space-y-1">
                        <button v-for="item in sections" :key="item.key" type="button"
                            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
                            :class="active === item.key ? 'bg-primary text-inverted font-medium' : 'text-toned hover:bg-muted/50'"
                            @click="selectSection(item.key)">
                            <UIcon :name="item.icon" class="size-4 shrink-0" />
                            <span class="flex-1">{{ item.label }}</span>
                        </button>
                    </nav>
                </UCard>

                <UCard :ui="{ body: 'p-2' }">
                    <p class="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        External Channels
                    </p>
                    <div class="space-y-1">
                        <div v-for="channel in channels" :key="channel.label"
                            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-toned hover:bg-muted/50"
                            @click="navigateTo(channel.to)">
                            <UIcon :name="channel.icon" class="size-4 shrink-0" />
                            <span class="flex-1">{{ channel.label }}</span>
                            <UIcon name="lucide:arrow-up-right" class="size-3.5 shrink-0" />
                        </div>
                    </div>
                </UCard>

                <UCard :ui="{ body: 'p-4' }"
                    class="bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20">
                    <div class="flex items-center gap-2 text-primary">
                        <UIcon name="lucide:book-open" class="size-4" />
                        <p class="text-sm font-semibold">Quick Guide</p>
                    </div>
                    <ul class="mt-2.5 space-y-2 text-xs text-toned">
                        <li><span class="font-medium">Domain:</span> the subdomain used for your school's login link.
                        </li>
                        <li><span class="font-medium">Logo:</span> use a square, transparent PNG - it appears on ID
                            cards and report cards.</li>
                        <li><span class="font-medium">Signature:</span> stamped on generated report cards and ID cards.
                        </li>
                    </ul>
                </UCard>
            </aside>

            <!-- Right Content - desktop only. On mobile the same section opens in the drawer
                 below instead of stacking under the tab list. -->
            <div class="hidden space-y-4 min-w-0 lg:block">
                <SettingsSchoolProfileTab v-if="active === 'profile'" :state="state" :logo-preview="logoPreview"
                    :signature-preview="signaturePreview" @select-logo="(f) => onFileChange('logo', f)"
                    @clear-logo="clearFile('logo')" @select-signature="(f) => onFileChange('signature', f)"
                    @clear-signature="clearFile('signature')" />

                <SettingsSchoolAttendanceTab v-else-if="active === 'attendance'" :state="attendanceState"
                    :loading-location="loadingLocation" :location-configured="locationConfigured" />
            </div>
        </div>

        <!-- Mobile: tapping a tab above opens this full-screen modal with that section, instead
             of the content stacking below the tab list in the single-column layout. -->
        <UModal v-model:open="mobilePanelOpen" fullscreen :ui="{ content: 'lg:hidden' }">
            <template #content>
                <UCard :ui="{ root: 'flex h-full flex-col rounded-none', body: 'flex-1 overflow-y-auto' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <p class="font-semibold text-highlighted">{{ activeSectionLabel }}</p>
                            <UButton icon="lucide:x" variant="ghost" color="neutral" size="sm"
                                aria-label="Close" @click="mobilePanelOpen = false" />
                        </div>
                    </template>

                    <div class="space-y-4">
                        <SettingsSchoolProfileTab v-if="active === 'profile'" :state="state" :logo-preview="logoPreview"
                            :signature-preview="signaturePreview" @select-logo="(f) => onFileChange('logo', f)"
                            @clear-logo="clearFile('logo')" @select-signature="(f) => onFileChange('signature', f)"
                            @clear-signature="clearFile('signature')" />

                        <SettingsSchoolAttendanceTab v-else-if="active === 'attendance'" :state="attendanceState"
                            :loading-location="loadingLocation" :location-configured="locationConfigured" />
                    </div>

                    <template #footer>
                        <div class="flex w-full gap-3">
                            <UButton v-if="active === 'profile'" label="Save Settings" icon="lucide:save"
                                class="flex-1 justify-center" :loading="saving" :disabled="loading" @click="save" />
                            <UButton v-else-if="active === 'attendance'" label="Save Location" icon="lucide:save"
                                class="flex-1 justify-center" :loading="savingLocation" :disabled="loadingLocation"
                                @click="saveAttendanceLocation" />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
const { success, error: toastError } = useNotify()
const { setCachedSchool } = useSchoolCache()

type SchoolProfile = {
    name: string
    motto: string
    domain: string
    street: string
    city: string
    region: string
    district: string
    chiefdom: string
    principalName: string
    primaryColor: string
    secondaryColor: string
}

const state = reactive<SchoolProfile>({
    name: '',
    motto: '',
    domain: '',
    street: '',
    city: '',
    region: '',
    district: '',
    chiefdom: '',
    principalName: '',
    primaryColor: '#1878c5',
    secondaryColor: '#0f172a'
})

const loading = ref(true)
const saving = ref(false)

const logoUrl = ref('')
const signatureUrl = ref('')
const logoFile = ref<File>()
const signatureFile = ref<File>()
const logoPreview = ref('')
const signaturePreview = ref('')

// Only the sections that actually do something - System & Formats/Security/Integrations were
// permanent "Soon" placeholders with no page behind them.
const sections = [
    { key: 'profile', label: 'School Profile', icon: SCHOOL_ICON },
    { key: 'attendance', label: 'Attendance', icon: ATTENDANCE_ICON }
]

const route = useRoute()
const initialSection = sections.some(s => s.key === route.query.section) ? String(route.query.section) : sections[0]!.key
const active = ref(initialSection)
const activeSectionLabel = computed(() => sections.find(s => s.key === active.value)?.label ?? '')

// Mobile only (see the USlideover in the template) - a tab tap both switches the active section
// and opens the drawer showing it; on desktop the drawer stays closed and this is a no-op since
// its content is lg:hidden regardless.
const mobilePanelOpen = ref(false)
function selectSection(key: string) {
    active.value = key
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        mobilePanelOpen.value = true
    }
}

// Only the channel(s) actually wired up - Social Media/Telegram Bot were permanent "Soon" rows
// with nowhere to click through to.
const channels = [
    { label: 'Notifications', icon: BELL_ICON, to: '/communicate/notifications' }
]

// Attendance tab - geofenced clock-in location.
const attendanceStore = useTeacherAttendanceStore()
const { locationSettings, loadingLocationSettings: loadingLocation, savingLocationSettings: savingLocation } = storeToRefs(attendanceStore)

const locationConfigured = computed(() => !!locationSettings.value?.configured)

const attendanceState = reactive({
    latitude: 0,
    longitude: 0,
    radiusMeters: 150,
    allowedIps: ''
})

async function saveAttendanceLocation() {
    try {
        await attendanceStore.saveLocationSettings({
            latitude: attendanceState.latitude,
            longitude: attendanceState.longitude,
            radiusMeters: attendanceState.radiusMeters,
            allowedIps: attendanceState.allowedIps || undefined
        })
        success('Clock-in location saved.')
    } catch (err: any) {
        toastError(err?.message || 'Unable to save location settings.')
    }
}

function onFileChange(key: 'logo' | 'signature', file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
        if (key === 'logo') logoPreview.value = e.target?.result as string
        else signaturePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    if (key === 'logo') logoFile.value = file
    else signatureFile.value = file
}

function clearFile(key: 'logo' | 'signature') {
    if (key === 'logo') {
        logoFile.value = undefined
        logoPreview.value = ''
        logoUrl.value = ''
    } else {
        signatureFile.value = undefined
        signaturePreview.value = ''
        signatureUrl.value = ''
    }
}

function applySchool(school: any) {
    state.name = school.name ?? ''
    state.motto = school.motto ?? ''
    state.domain = school.domain ?? ''
    state.street = school.address?.street ?? ''
    state.city = school.address?.city ?? ''
    state.region = school.address?.region ?? ''
    state.district = school.address?.district ?? ''
    state.chiefdom = school.address?.chiefdom ?? ''
    state.principalName = school.principalName ?? ''
    state.primaryColor = school.primaryColor ?? '#1878c5'
    state.secondaryColor = school.secondaryColor ?? '#0f172a'
    logoUrl.value = school.logo ?? ''
    signatureUrl.value = school.principalSignature ?? ''
    logoPreview.value = logoUrl.value
    signaturePreview.value = signatureUrl.value
}

async function save() {
    saving.value = true
    try {
        const updated = await SchoolApi().update({
            name: state.name,
            domain: state.domain,
            region: state.region,
            district: state.district,
            chiefdom: state.chiefdom,
            city: state.city,
            street: state.street
        })

        if (!updated) return

        const formData = new FormData()
        formData.append('motto', state.motto || '')
        formData.append('principalName', state.principalName || '')
        formData.append('primaryColor', state.primaryColor || '')
        formData.append('secondaryColor', state.secondaryColor || '')
        if (logoFile.value) formData.append('logo', logoFile.value)
        if (signatureFile.value) formData.append('principalSignature', signatureFile.value)

        const branded = await SchoolApi().updateBranding(formData)
        if (!branded) return

        applySchool(branded)
        applyBrandColors(branded.primaryColor, branded.secondaryColor)

        // Keep the offline cache (see useSchoolCache) in step too, or it'd keep serving the old
        // colors instantly on the next visit until something else happens to refetch and overwrite it.
        const domain = resolveTenantSlug(window.location.hostname)
        if (domain) setCachedSchool(domain, branded)

        logoFile.value = undefined
        signatureFile.value = undefined
        success('School settings saved')
    } catch (err: any) {
        toastError(err?.message || 'Failed to save school settings')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    useAppStore().setTitle('Settings')
    document.title = 'School Settings | Skultem'

    loading.value = true
    try {
        const school = await SchoolApi().get('current')
        if (school) applySchool(school)
    } finally {
        loading.value = false
    }

    await attendanceStore.fetchLocationSettings()
    if (locationSettings.value) {
        attendanceState.latitude = locationSettings.value.latitude
        attendanceState.longitude = locationSettings.value.longitude
        attendanceState.radiusMeters = locationSettings.value.radiusMeters || 150
        attendanceState.allowedIps = locationSettings.value.allowedIps || ''
    }
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>