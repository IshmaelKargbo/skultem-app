<template>
    <div class="px-4 pt-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0' }">
            <div class="flex items-center justify-between">
                <div class="flex space-x-2 px-5 py-3 items-center">
                    <div>
                        <UButton v-if="back" :icon="BACK_ICON" color="neutral" variant="ghost" class="shrink-0 -ml-1"
                            aria-label="Go back" @click="router.back()" />
                        <MenuDrawer v-else class="md:hidden block shrink-0" />
                    </div>
                    <div class="min-w-0 flex-1">
                        <p v-if="title"
                            class="min-w-0 truncate font-display font-semibold transition-colors sm:text-base"
                            :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                            {{ title }}
                        </p>
                        <USkeleton v-else class="h-4 w-44 max-w-full" />

                        <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span class="text-xs font-medium text-muted">{{ displayYearName }}</span>
                            <UBadge :color="yearStatus.color" variant="subtle" size="sm" class="gap-1 hidden md:flex">
                                <UIcon :name="yearStatus.icon" class="size-3" />
                                {{ yearStatus.label }}
                            </UBadge>
                            <div class="hidden md:flex items-center space-x-2" v-if="termSubtitle">
                                <span class="text-muted">&middot;</span>
                                <p class="text-xs text-muted">
                                    {{ termSubtitle }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hidden sm:flex flex-col items-center leading-tight py-1">
                    <span class="text-sm font-semibold tabular-nums text-toned">{{ time }}</span>
                    <span class="hidden text-xs-base text-muted md:block">{{ date }}</span>
                </div>
                <div class="flex shrink-0 items-center gap-3 pr-5">
                    <div class="md:block border-r border-default pr-3 hidden">
                        <AccountSwitch />
                    </div>
                    <div class="flex items-center gap-3">
                        <UButton v-if="canManageSettings" :icon="SETTINGS_ICON" variant="ghost" color="neutral"
                            to="/settings/school" aria-label="Settings" />
                        <Notification />
                        <Me compact />
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const { title, back } = storeToRefs(store)

const router = useRouter()
const route = useRoute()

const { can, activeRole } = useAuth()

const canSwitchYear = computed(() => can([Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]))
const canManageSettings = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const academicYearStore = useAcademicYearStore()
const { records: academicYears, terms, viewingYear } = storeToRefs(academicYearStore)

onMounted(() => {
    if (canSwitchYear.value && !academicYears.value.length) academicYearStore.fetchAll(1, 50)
    if (!terms.value.length) academicYearStore.getTerms()
})

const yearOptions = computed(() =>
    academicYears.value.map((year) => ({
        value: year.id,
        label: year.active ? `${year.name} (Active)` : year.name,
        icon: year.active ? 'i-lucide-circle-check' : year.status === 'CLOSED' ? 'i-lucide-lock' : 'i-lucide-clock'
    }))
)

const viewingYearId = computed({
    get: () => viewingYear.value?.id ?? null,
    set: (id: string | null) => academicYearStore.setViewingYear(id)
})

const activeTerm = computed(() => terms.value.find((term) => term.status === 'ACTIVE'))
const displayYearName = computed(() => viewingYear.value?.name ?? activeTerm.value?.academicYear?.name ?? '')

type YearStatusStyle = { label: string, color: 'success' | 'warning' | 'error', icon: string }

const yearStatus = computed<YearStatusStyle>(() => {
    if (!viewingYear.value || viewingYear.value.active) {
        return { label: 'Active', color: 'success', icon: 'i-lucide-circle-check' }
    }

    if (viewingYear.value.status === 'CLOSED') {
        return { label: 'Closed', color: 'error', icon: 'i-lucide-lock' }
    }

    return { label: 'Upcoming', color: 'warning', icon: 'i-lucide-clock' }
})

const termSubtitle = computed(() => {
    if (viewingYear.value && !viewingYear.value.active) return ''
    if (activeTerm.value) return activeTerm.value.name

    if (!terms.value.length) return 'No Terms Yet'
    return terms.value.every((term) => term.status === 'CLOSED') ? 'Term Completed' : 'Awaiting Next Term'
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Breadcrumb — one crumb per path segment, most specific last (labelled with
// the page's own title when available). Segments that look like ids
// (uuids/numeric ids) aren't meaningful to show raw, so they fall back to a
// generic label.
const crumbs = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    let acc = ''
    return segments.map((segment, i) => {
        acc += `/${segment}`
        const isLast = i === segments.length - 1
        return {
            to: acc,
            label: isLast && title.value ? title.value : formatSegment(segment)
        }
    })
})

function formatSegment(segment: string) {
    if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) return 'Details'
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Live clock — the app runs with ssr disabled, so there's no hydration
// mismatch to guard against here.
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
    timer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => clearInterval(timer))

const time = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const date = computed(() => now.value.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }))
</script>
