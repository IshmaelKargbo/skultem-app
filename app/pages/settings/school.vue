<template>
    <div class="px-4 md:px-6 space-y-4">
        <Heading title="School Settings"
            subtitle="Manage your school's profile, contact details and academic preferences">
            <div class="flex gap-3">
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

            <!-- Right Content -->
            <div class="space-y-4 min-w-0">
                <template v-if="active === 'profile'">
                    <UCard>
                        <template #header>
                            <p>General Information</p>
                        </template>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <UFormField required label="School Name">
                                <UInput v-model="state.name" placeholder="e.g. King's Way International School"
                                    class="w-full" />
                            </UFormField>

                            <UFormField required label="Domain" help="Used for your school's login link">
                                <UInput v-model="state.domain" placeholder="e.g. kingsway" class="w-full" />
                            </UFormField>

                            <UFormField label="Principal Name">
                                <UInput v-model="state.principalName" placeholder="e.g. Dr. A. Conteh" class="w-full" />
                            </UFormField>
                        </div>
                    </UCard>
                    <UCard>
                        <template #header>
                            <p>Address</p>
                        </template>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <UFormField required label="Street">
                                <UInput v-model="state.street" placeholder="e.g. 12 Wilkinson Road" class="w-full" />
                            </UFormField>

                            <UFormField required label="City">
                                <UInput v-model="state.city" placeholder="e.g. Freetown" class="w-full" />
                            </UFormField>

                            <UFormField required label="Region">
                                <UInput v-model="state.region" placeholder="e.g. Western Area" class="w-full" />
                            </UFormField>

                            <UFormField required label="District">
                                <UInput v-model="state.district" placeholder="e.g. Freetown" class="w-full" />
                            </UFormField>

                            <UFormField required label="Chiefdom">
                                <UInput v-model="state.chiefdom" placeholder="e.g. Freetown Municipality"
                                    class="w-full" />
                            </UFormField>
                        </div>
                    </UCard>

                    <UCard>
                        <template #header>
                            <p>Branding & Appearance</p>
                        </template>
                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <UploadTile label="School Logo" hint="Square PNG" :src="logoPreview"
                                @select="(f) => onFileChange('logo', f)" @clear="clearFile('logo')" />
                            <UploadTile label="Principal Signature" hint="Transparent PNG" :src="signaturePreview" muted
                                @select="(f) => onFileChange('signature', f)" @clear="clearFile('signature')" />
                        </div>

                        <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-5 sm:grid-cols-2">
                            <UFormField label="Primary Color" help="Used for headers and accents on ID cards">
                                <ColorPicker v-model="state.primaryColor" />
                            </UFormField>

                            <UFormField label="Secondary Color" help="Used for footers and secondary accents">
                                <ColorPicker v-model="state.secondaryColor" />
                            </UFormField>
                        </div>
                    </UCard>
                </template>

                <template v-else-if="active === 'attendance'">
                    <div v-if="loadingLocation" class="flex justify-center py-14">
                        <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl text-muted" />
                    </div>

                    <template v-else>
                        <UAlert v-if="!locationConfigured" color="warning" variant="subtle" icon="lucide:triangle-alert"
                            title="Not set up yet"
                            description="Teachers can't clock in until a location is saved here." />
                        <UCard>
                            <template #header>
                                <p>Clock-In Location</p>
                            </template>
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <UFormField required label="Latitude">
                                    <UInput v-model.number="attendanceState.latitude" type="number" step="any"
                                        class="w-full" />
                                </UFormField>

                                <UFormField required label="Longitude">
                                    <UInput v-model.number="attendanceState.longitude" type="number" step="any"
                                        class="w-full" />
                                </UFormField>
                            </div>

                            <UButton class="mt-4" variant="soft" icon="lucide:crosshair" :loading="locating"
                                @click="useCurrentLocation">
                                Use My Current Location
                            </UButton>
                            <p class="mt-2 text-xs text-muted">Stand at the school when you press this, or enter
                                coordinates manually.</p>
                        </UCard>

                        <UCard>
                            <template #header>
                                <p>Allowed Radius</p>
                            </template>
                            <UFormField required label="Radius (metres)"
                                help="How far from the school a teacher can be and still clock in.">
                                <UInput v-model.number="attendanceState.radiusMeters" type="number" min="10"
                                    class="w-full" />
                            </UFormField>
                        </UCard>

                        <UCard>
                            <template #header>
                                <p>Network Restriction</p>
                            </template>
                            <UFormField label="Allowed IP Addresses"
                                help="Comma-separated IPs and/or ranges (e.g. 41.66.12.5, 192.168.1.0/24). Leave blank to skip this check - location alone will decide.">
                                <UTextarea v-model="attendanceState.allowedIps" :rows="2"
                                    placeholder="e.g. 41.66.12.5, 192.168.1.0/24" class="w-full" />
                            </UFormField>

                            <p class="mt-3 flex items-start gap-1.5 text-xs text-muted">
                                <UIcon name="lucide:info" class="mt-0.5 size-3.5 shrink-0" />
                                When set, a clock-in must come from the school's own network as well as be within range
                                - a second layer against someone clocking in for a colleague from elsewhere.
                            </p>
                        </UCard>
                    </template>
                </template>

                <template v-else>
                    <UCard>
                        <template #header>
                            <p>{{ comingSoon.label }}</p>
                        </template>
                        <div class="flex flex-col items-center gap-2 py-14 text-center">
                            <UIcon :name="comingSoon.icon" class="text-4xl text-muted" />
                            <p class="text-sm font-medium text-highlighted">{{ comingSoon.label }} settings are coming
                                soon</p>
                            <p class="max-w-xs text-xs text-muted">{{ comingSoon.description }}</p>
                        </div>
                    </UCard>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ColorPicker from '~/components/id-cards/ColorPicker.vue'

const { success, error: toastError } = useNotify()

type SchoolProfile = {
    name: string
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

const sections = [
    { key: 'profile', label: 'School Profile', icon: SCHOOL_ICON },
    { key: 'formats', label: 'System & Formats', icon: 'lucide:sliders-horizontal', soon: true },
    { key: 'attendance', label: 'Attendance', icon: ATTENDANCE_ICON },
    { key: 'security', label: 'Security', icon: 'lucide:shield', soon: true },
    { key: 'integrations', label: 'Integrations', icon: 'lucide:plug', soon: true }
]

const route = useRoute()
const initialSection = sections.some(s => s.key === route.query.section) ? String(route.query.section) : sections[0]!.key
const active = ref(initialSection)

const comingSoonCopy: Record<string, { label: string, icon: string, description: string }> = {
    formats: { label: 'System & Formats', icon: 'lucide:sliders-horizontal', description: 'Academic year dates, language, timezone and currency preferences will be configurable here.' },
    security: { label: 'Security', icon: 'lucide:shield', description: 'Password policy and session controls will live here.' },
    integrations: { label: 'Integrations', icon: 'lucide:plug', description: 'Connect third-party tools and services from here.' }
}

const comingSoon = computed(() => comingSoonCopy[active.value] ?? comingSoonCopy.formats!)

const channels = [
    { label: 'Social Media', icon: 'lucide:share-2' },
    { label: 'Telegram Bot', icon: 'lucide:send' },
    { label: 'Notifications', icon: BELL_ICON, to: '/communicate/notifications' }
]

// Attendance tab - geofenced clock-in location.
const attendanceStore = useTeacherAttendanceStore()
const { locationSettings, loadingLocationSettings: loadingLocation, savingLocationSettings: savingLocation } = storeToRefs(attendanceStore)

const locationConfigured = computed(() => !!locationSettings.value?.configured)
const locating = ref(false)

const attendanceState = reactive({
    latitude: 0,
    longitude: 0,
    radiusMeters: 150,
    allowedIps: ''
})

function useCurrentLocation() {
    if (!navigator.geolocation) {
        toastError('Your browser does not support location services.')
        return
    }

    locating.value = true
    navigator.geolocation.getCurrentPosition(
        (position) => {
            attendanceState.latitude = position.coords.latitude
            attendanceState.longitude = position.coords.longitude
            locating.value = false
            success('Location captured.')
        },
        (err) => {
            locating.value = false
            toastError(err.code === 1 ? 'Location access was denied.' : 'Unable to determine your location.')
        },
        { enableHighAccuracy: true, timeout: 15000 }
    )
}

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
        formData.append('principalName', state.principalName || '')
        formData.append('primaryColor', state.primaryColor || '')
        formData.append('secondaryColor', state.secondaryColor || '')
        if (logoFile.value) formData.append('logo', logoFile.value)
        if (signatureFile.value) formData.append('principalSignature', signatureFile.value)

        const branded = await SchoolApi().updateBranding(formData)
        if (!branded) return

        applySchool(branded)
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
