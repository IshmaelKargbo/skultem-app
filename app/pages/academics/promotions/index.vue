<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Promotions')
    document.title = 'Promotions | Academics | Skultem'
    loadProgress()
    loadRequests()
    loadConfig()
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useNotify()

const progress = ref<PromotionProgress | null>(null)
const progressLoading = ref(true)
const closingYear = ref(false)

const hasOutstandingPlatformFee = computed(() => (progress.value?.outstandingPlatformFee ?? 0) > 0)

function formatMoney(value: number) {
    return `${new Intl.NumberFormat().format(value || 0)} SLE`
}

const requests = ref<PromotionRequest[]>([])
const meta = ref<Meta>({} as Meta)
const requestsLoading = ref(true)

// No "All statuses" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). Nothing selected already shows the placeholder below, and the
// select's own clear button (:clear) gets back to it.
const statusOptions = [
    { label: 'Pending Review', value: 'PENDING_REVIEW' },
    { label: 'Returned', value: 'RETURNED' },
    { label: 'Approved', value: 'APPROVED' }
]

const status = computed<string>({
    get: () => String(route.query.status ?? ''),
    set: value => updateQuery({ status: value || undefined, page: 1 })
})

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: value => updateQuery({ page: value })
})

const size = computed<number>(() => Number(route.query.size ?? runtimeConf().limit))

function updateQuery(query: Record<string, any>) {
    router.replace({ query: { ...route.query, ...query } })
}

const columns = [
    { accessorKey: 'sessionName', header: 'Class' },
    { accessorKey: 'classMasterName', header: 'Class Master' },
    { accessorKey: 'submittedAt', header: 'Submitted' },
    { accessorKey: 'counts', header: 'Decisions' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'actions', meta: { class: { td: 'text-right' } } }
]

async function loadProgress() {
    progressLoading.value = true
    try {
        progress.value = await PromotionApi().getPromotionProgress() || null
    } finally {
        progressLoading.value = false
    }
}

async function loadRequests() {
    requestsLoading.value = true
    try {
        const res = await PromotionApi().listPromotionRequests(status.value || undefined, page.value, size.value)
        requests.value = res?.data || []
        meta.value = res?.meta || {} as Meta
    } finally {
        requestsLoading.value = false
    }
}

watch([status, page], loadRequests)

async function closeYear() {
    closingYear.value = true
    try {
        const res = await PromotionApi().closeAcademicYear()
        if (res) {
            toastSuccess('Academic year closed - next year is now active')
            await loadProgress()
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to close academic year')
    } finally {
        closingYear.value = false
    }
}

// --- Promotion rules ---
const configModal = ref(false)
const configLoading = ref(false)
const savingConfig = ref(false)
const configForm = reactive<PromotionConfig>({
    minPassMark: null,
    maxRepeatCount: 2,
    requireApproval: true,
    requireRemarkForPromote: false
})

async function loadConfig() {
    configLoading.value = true
    try {
        const res = await PromotionApi().getPromotionConfig()
        if (res) Object.assign(configForm, res)
    } finally {
        configLoading.value = false
    }
}

function openConfig() {
    configModal.value = true
}

async function saveConfig() {
    savingConfig.value = true
    try {
        const res = await PromotionApi().updatePromotionConfig({ ...configForm })
        if (res) {
            toastSuccess('Promotion rules updated')
            Object.assign(configForm, res)
            configModal.value = false
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to update promotion rules')
    } finally {
        savingConfig.value = false
    }
}
</script>

<template>
    <div class="px-4 md:px-6 overflow-y-auto h-full space-y-4">
        <Heading title="Promotions"
            subtitle="Review class masters' promotion submissions and close out the academic year">
            <UButton to="/classes" variant="soft" color="primary" :icon="PROMOTE_STUDENTS_ICON"
                label="Start a Promotion" />
        </Heading>
        <UCard>
            <div v-if="progressLoading" class="space-y-3">
                <USkeleton class="h-5 w-48" />
                <USkeleton class="h-2 w-full rounded-full" />
            </div>

            <div v-else-if="progress" class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p class="text-sm font-semibold text-highlighted">{{ progress.academicYearName }}</p>
                        <p class="text-xs text-muted">{{ progress.completedSessions }} of {{ progress.totalSessions }}
                            classes promoted</p>
                    </div>

                    <UTooltip :text="!progress.nextAcademicYearConfigured
                        ? 'Create next academic year before closing this one'
                        : hasOutstandingPlatformFee
                            ? `Settle ${formatMoney(progress.outstandingPlatformFee)} in outstanding platform fees first`
                            : !progress.readyToCloseYear
                                ? `${progress.pendingSessions} class(es) still need to be promoted`
                                : ''">
                        <UButton icon="i-lucide-calendar-check" label="Close Year & Activate Next"
                            :disabled="!progress.readyToCloseYear || !progress.nextAcademicYearConfigured || hasOutstandingPlatformFee"
                            :loading="closingYear" @click="closeYear" />
                    </UTooltip>
                </div>

                <div class="h-2 w-full overflow-hidden rounded-full bg-elevated">
                    <div class="h-full rounded-full bg-primary transition-all"
                        :style="{ width: `${progress.totalSessions ? (progress.completedSessions / progress.totalSessions) * 100 : 0}%` }" />
                </div>

                <UAlert v-if="!progress.nextAcademicYearConfigured" color="warning" variant="soft" icon="i-lucide-info"
                    title="Next academic year not configured"
                    description="Set up the next academic year from Academic Years before you can close this one out." />

                <UAlert v-if="hasOutstandingPlatformFee" color="warning" variant="soft" icon="i-lucide-banknote"
                    title="Outstanding platform fees"
                    :description="`This school still owes ${formatMoney(progress.outstandingPlatformFee)} in platform fees. Settle the balance before closing the year.`" />
            </div>
        </UCard>

        <!-- Promotion rules, always visible -->
        <UCard>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-settings-2" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold">Promotion Rules</h3>
                </div>
                <UButton size="xs" variant="soft" color="neutral" icon="i-lucide-pencil" label="Edit"
                    @click="openConfig" />
            </div>

            <div v-if="configLoading" class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-xl" />
            </div>

            <div v-else class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Pass Mark</p>
                    <p class="text-lg font-semibold text-highlighted">{{ configForm.minPassMark != null ?
                        `${configForm.minPassMark}%` : 'Not set' }}</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Max Repeats</p>
                    <p class="text-lg font-semibold text-highlighted">{{ configForm.maxRepeatCount }}</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Admin Approval</p>
                    <p class="text-lg font-semibold text-highlighted">{{ configForm.requireApproval ? 'Required' : 'Not required' }}</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Remark for Promote</p>
                    <p class="text-lg font-semibold text-highlighted">{{ configForm.requireRemarkForPromote ? 'Required'
                        : 'Optional' }}</p>
                </div>
            </div>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-semibold">Promotion Requests</h3>
                    <USelectMenu v-model="status" value-key="value" :items="statusOptions" placeholder="All statuses"
                        clear class="w-48" />
                </div>
            </template>

            <UTable :columns="columns" :data="requests" :loading="requestsLoading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon :name="PROMOTE_STUDENTS_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No promotion requests found.</p>
                    </div>
                </template>
                <template #submittedAt-cell="{ row }">
                    <p>{{ formatDate(row.original.submittedAt) }}</p>
                </template>
                <template #counts-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <UBadge color="success" variant="subtle" size="sm">{{ row.original.promoteCount }} Promote
                        </UBadge>
                        <UBadge color="warning" variant="subtle" size="sm">{{ row.original.repeatCount }} Repeat
                        </UBadge>
                    </div>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="promotionRequestStatusStyle[row.original.status as PromotionRequestStatus]?.label"
                        :color="promotionRequestStatusStyle[row.original.status as PromotionRequestStatus]?.color"
                        variant="soft" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton :to="`/academics/promotions/${row.original.id}`" size="sm" variant="ghost" color="primary"
                        :icon="VIEW_ICON" />
                </template>
            </UTable>

            <template #footer>
                <div v-if="requests.length" class="flex items-center justify-between">
                    <Showing :meta="meta" />
                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>

        <UModal v-model:open="configModal" :ui="{ content: 'sm:max-w-md' }">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-settings-2" class="size-5 text-primary" />
                            <h3 class="text-lg font-semibold">Promotion Rules</h3>
                        </div>
                    </template>

                    <div v-if="configLoading" class="space-y-3">
                        <USkeleton v-for="i in 4" :key="i" class="h-10 w-full rounded-lg" />
                    </div>

                    <div v-else class="space-y-4">
                        <UFormField label="Minimum pass mark"
                            hint="Auto-suggests Promote/Repeat per student on the roster - the class master can still override it">
                            <UInput v-model.number="configForm.minPassMark" type="number" min="0" max="100"
                                placeholder="No minimum set" class="w-full">
                                <template #trailing>
                                    <span class="text-xs text-muted">%</span>
                                </template>
                            </UInput>
                        </UFormField>

                        <UFormField label="Max times a student can repeat a class"
                            hint="Submitting a repeat beyond this is blocked">
                            <UInput v-model.number="configForm.maxRepeatCount" type="number" min="1" class="w-full" />
                        </UFormField>

                        <div class="flex items-center justify-between rounded-xl border border-default p-3">
                            <div class="min-w-0 pr-3">
                                <p class="text-sm font-medium text-highlighted">Require admin approval</p>
                                <p class="text-xs text-muted">When off, a class master's submission promotes students
                                    immediately</p>
                            </div>
                            <USwitch v-model="configForm.requireApproval" />
                        </div>

                        <div class="flex items-center justify-between rounded-xl border border-default p-3">
                            <div class="min-w-0 pr-3">
                                <p class="text-sm font-medium text-highlighted">Require a remark for every student</p>
                                <p class="text-xs text-muted">By default only students marked to repeat need one</p>
                            </div>
                            <USwitch v-model="configForm.requireRemarkForPromote" />
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <UButton label="Cancel" variant="soft" color="neutral" :disabled="savingConfig"
                                @click="configModal = false" />
                            <UButton label="Save Rules" :loading="savingConfig" @click="saveConfig" />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
