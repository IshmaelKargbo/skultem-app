<script lang="ts" setup>
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useNotify()

const sessionId = computed(() => String(route.params.sessionId))

const loading = ref(true)
const submitting = ref(false)
const roster = ref<PromotionRoster | null>(null)
const request = ref<PromotionRequest | null>(null)
const config = ref<PromotionConfig | null>(null)

type DraftRow = {
    studentId: string
    enrollmentId: string
    studentName: string
    admissionNumber: string
    average: number | null
    outcome: PromotionOutcome
    remark: string
    targetStreamId: string | null
    targetStreamName: string | null
}

const draft = ref<DraftRow[]>([])
const note = ref('')
const confirmModal = ref(false)

const isEditable = computed(() => !request.value || request.value.status === 'RETURNED')

const isTerminalClass = computed(() => roster.value?.targetClassName === 'Graduation')
const promoteLabel = computed(() => isTerminalClass.value ? 'Graduate' : 'Promote')
const promoteVerb = computed(() => isTerminalClass.value ? 'Graduating' : 'Promoting')

const promoteCount = computed(() => draft.value.filter(r => r.outcome === 'PROMOTE').length)
const repeatCount = computed(() => draft.value.filter(r => r.outcome === 'REPEAT').length)

const passMark = computed(() => config.value?.minPassMark ?? null)

const passingRows = computed(() => passMark.value == null
    ? []
    : draft.value.filter(r => r.average != null && r.average >= passMark.value!))
const failingRows = computed(() => passMark.value == null
    ? []
    : draft.value.filter(r => r.average != null && r.average < passMark.value!))
const unscoredRows = computed(() => passMark.value == null
    ? draft.value
    : draft.value.filter(r => r.average == null))

type RowGroup = { key: string, label: string | null, icon?: string, color?: 'success' | 'error' | 'neutral', rows: DraftRow[] }

const groupedRows = computed<RowGroup[]>(() => {
    if (passMark.value == null) {
        return draft.value.length ? [{ key: 'all', label: null, rows: draft.value }] : []
    }

    const groups: RowGroup[] = []
    if (passingRows.value.length) {
        groups.push({ key: 'pass', label: 'Passed', icon: 'i-lucide-check', color: 'success', rows: passingRows.value })
    }
    if (failingRows.value.length) {
        groups.push({ key: 'fail', label: 'Needs a decision', icon: 'i-lucide-triangle-alert', color: 'error', rows: failingRows.value })
    }
    if (unscoredRows.value.length) {
        groups.push({ key: 'unscored', label: 'No scores yet', icon: 'i-lucide-circle-help', color: 'neutral', rows: unscoredRows.value })
    }
    return groups
})

function isAllowToPassOverride(row: DraftRow) {
    return row.outcome === 'PROMOTE' && passMark.value != null && row.average != null && row.average < passMark.value
}

const missingRemarks = computed(() => draft.value.filter(r =>
    (r.outcome === 'REPEAT' || isAllowToPassOverride(r) || config.value?.requireRemarkForPromote) && !r.remark.trim()
).length)

const missingStreams = computed(() => {
    if (!roster.value?.requiresStreamSelection) return 0
    return draft.value.filter(r => r.outcome === 'PROMOTE' && !r.targetStreamId).length
})

const streamOptions = computed(() => (roster.value?.availableStreams || []).map(s => ({ label: s.name, value: s.id })))

const canSubmit = computed(() =>
    isEditable.value
    && !!roster.value?.eligible
    && draft.value.length > 0
    && missingRemarks.value === 0
    && missingStreams.value === 0
)

function buildDraftFromRoster(source: RosterStudent[]) {
    draft.value = source.map(s => ({
        studentId: s.studentId,
        enrollmentId: s.enrollmentId,
        studentName: s.studentName,
        admissionNumber: s.admissionNumber,
        average: s.average,
        outcome: s.suggestedOutcome || 'PROMOTE',
        remark: '',
        targetStreamId: null,
        targetStreamName: null
    }))
}

function buildDraftFromRequest(req: PromotionRequest) {
    draft.value = req.items.map(item => ({
        studentId: item.studentId,
        enrollmentId: item.enrollmentId,
        studentName: item.studentName,
        admissionNumber: item.admissionNumber,
        average: roster.value?.students.find(s => s.studentId === item.studentId)?.average ?? null,
        outcome: item.outcome,
        remark: item.remark || '',
        targetStreamId: item.targetStreamId,
        targetStreamName: item.targetStreamName
    }))
    note.value = req.teacherNote || ''
}

function markAllPromote() {
    draft.value.forEach((row) => { row.outcome = 'PROMOTE' })
}

async function load() {
    loading.value = true
    try {
        const [rosterRes, requestRes, configRes] = await Promise.all([
            PromotionApi().getPromotionRoster(sessionId.value),
            PromotionApi().getCurrentPromotionRequestForSession(sessionId.value),
            PromotionApi().getPromotionConfig()
        ])

        roster.value = rosterRes || null
        request.value = requestRes || null
        config.value = configRes || null

        if (request.value) {
            buildDraftFromRequest(request.value)
        } else if (roster.value) {
            buildDraftFromRoster(roster.value.students)
        }
    } finally {
        loading.value = false
    }
}

async function submit() {
    if (!canSubmit.value) return

    submitting.value = true
    try {
        const res = await PromotionApi().submitPromotionRequest(
            sessionId.value,
            note.value,
            draft.value.map(row => ({
                studentId: row.studentId,
                enrollmentId: row.enrollmentId,
                outcome: row.outcome,
                remark: row.remark.trim() || null,
                targetStreamId: row.outcome === 'PROMOTE' ? row.targetStreamId : null
            }))
        )

        if (res) {
            toastSuccess(res.status === 'APPROVED'
                ? `${res.promotedCount} promoted, ${res.repeatedCount} repeating`
                : 'Promotion submitted for review')
            confirmModal.value = false
            request.value = res
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to submit promotion')
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Promote Class')
    useAppStore().setBack(true)
    document.title = 'Promote Class | Skultem'
    load()
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-4">
        <div v-if="loading" class="space-y-3">
            <USkeleton class="h-20 w-full rounded-xl" />
            <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
        </div>

        <template v-else>
            <UAlert v-if="request?.status === 'PENDING_REVIEW'" color="warning" variant="subtle" icon="i-lucide-clock"
                title="Awaiting review"
                :description="`Submitted ${formatDate(request.submittedAt)}. An admin or proprietor needs to approve this before students are moved.`" />

            <UAlert v-else-if="request?.status === 'APPROVED'" color="success" variant="subtle"
                icon="i-lucide-check-circle-2" title="Promotion approved"
                :description="`${request.promotedCount} promoted, ${request.repeatedCount} repeating. Executed ${formatDate(request.executedAt || undefined)}.`" />

            <UAlert v-else-if="request?.status === 'RETURNED'" color="error" variant="subtle"
                icon="i-lucide-corner-up-left" title="Returned for changes"
                :description="request.returnReason || 'An admin returned this submission.'" />

            <UAlert v-if="roster && !roster.eligible && isEditable" color="warning" variant="subtle"
                icon="i-lucide-info" title="Not ready to promote yet"
                :description="roster.ineligibleReason || 'This class is not eligible for promotion yet.'" />

            <UAlert v-if="isEditable && roster?.requiresStreamSelection" color="info" variant="subtle"
                icon="i-lucide-git-branch" title="Choose a stream for each promoted student"
                description="This class moves into a Senior Secondary class - pick the stream (e.g. Science, Arts, Commercial) each promoted student will join." />

            <!-- Stats -->
            <div v-if="draft.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric :record="{
                    label: promoteVerb,
                    color: 'success',
                    icon: STUDENT_ICON,
                    isReady: !loading,
                    value: promoteCount
                }" />
                <Metric :record="{
                    label: 'Repeating',
                    color: 'error',
                    icon: 'i-lucide-rotate-ccw',
                    isReady: !loading,
                    value: repeatCount
                }" />

                <Metric :record="{
                    label: `Passed (${passMark}%)`,
                    color: 'info',
                    icon: 'i-lucide-check',
                    isReady: !loading,
                    value: passingRows.length
                }" />

                <Metric :record="{
                    label: 'Failed',
                    color: 'error',
                    icon: 'i-lucide-x',
                    isReady: !loading,
                    value: failingRows.length
                }" />
            </div>

            <UCard v-if="draft.length" :ui="{ body: 'p-0 sm:p-0' }">
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <h3 class="font-semibold">{{ roster?.sessionName }}</h3>
                        <UButton v-if="isEditable" size="xs" variant="soft" color="neutral"
                            :label="`Mark all ${promoteLabel}`" @click="markAllPromote" />
                    </div>
                </template>

                <div v-for="group in groupedRows" :key="group.key">
                    <div v-if="group.label" class="flex items-center gap-2 bg-elevated/60 px-4 py-2">
                        <UIcon :name="group.icon!" class="size-3.5"
                            :class="group.color === 'success' ? 'text-success' : group.color === 'error' ? 'text-error' : 'text-muted'" />
                        <p class="text-xs font-semibold uppercase tracking-wide text-muted">{{ group.label }} ({{
                            group.rows.length
                            }})</p>
                    </div>

                    <ul class="divide-y divide-default">
                        <li v-for="row in group.rows" :key="row.studentId" class="flex flex-col gap-3 p-4">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <UAvatar :alt="row.studentName" />

                                    <div class="min-w-0">
                                        <p class="truncate font-medium text-highlighted">{{ row.studentName }}</p>
                                        <div class="flex flex-wrap items-center gap-1.5 text-xs-base text-muted">
                                            <span>Admission No. {{ row.admissionNumber }}</span>
                                            <template v-if="row.average != null">
                                                <span class="size-1 rounded-full bg-dimmed" />
                                                <span
                                                    :class="passMark != null && row.average < passMark ? 'text-error font-medium' : 'text-success font-medium'">
                                                    {{ Math.round(row.average) }}% average
                                                </span>
                                            </template>
                                            <template v-else>
                                                <span class="size-1 rounded-full bg-dimmed" />
                                                <span>No scores yet</span>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                                <div class="space-x-2 items-center flex" v-if="isEditable">
                                    <UButton size="sm"
                                        :icon="passMark != null && row.average != null && row.average < passMark ? 'i-lucide-shield-check' : undefined"
                                        :color="row.outcome === 'PROMOTE' ? 'success' : 'neutral'"
                                        :variant="row.outcome === 'PROMOTE' ? 'solid' : 'outline'"
                                        :label="passMark != null && row.average != null && row.average < passMark ? `Allow to ${promoteLabel}` : promoteLabel"
                                        @click="row.outcome = 'PROMOTE'" />
                                    <UButton size="sm" :color="row.outcome === 'REPEAT' ? 'warning' : 'neutral'"
                                        :variant="row.outcome === 'REPEAT' ? 'solid' : 'outline'" label="Repeat"
                                        @click="row.outcome = 'REPEAT'" />
                                </div>

                                <UBadge v-else :color="row.outcome === 'PROMOTE' ? 'success' : 'warning'"
                                    variant="subtle"
                                    :icon="isAllowToPassOverride(row) ? 'i-lucide-shield-check' : undefined">
                                    {{ isAllowToPassOverride(row) ? `Allowed to ${promoteLabel}` : (row.outcome ===
                                        'PROMOTE' ?
                                        promoteVerb : 'Repeating') }}
                                </UBadge>
                            </div>

                            <USelectMenu
                                v-if="isEditable && row.outcome === 'PROMOTE' && roster?.requiresStreamSelection"
                                v-model="row.targetStreamId" value-key="value" :items="streamOptions"
                                placeholder="Select stream" size="sm" class="w-full sm:w-56 sm:ml-11" />
                            <UBadge v-else-if="row.outcome === 'PROMOTE' && row.targetStreamName" color="neutral"
                                variant="subtle" class="w-fit sm:ml-11">
                                {{ row.targetStreamName }}
                            </UBadge>

                            <UTextarea v-if="isEditable" v-model="row.remark" :placeholder="row.outcome === 'REPEAT'
                                ? 'Remark required - why is this student repeating?'
                                : isAllowToPassOverride(row)
                                    ? `Remark required - why are you allowing this student to ${promoteLabel.toLowerCase()}?`
                                    : config?.requireRemarkForPromote ? 'Remark required' : 'Remark (optional)'"
                                :rows="1" autoresize />
                            <p v-else-if="row.remark" class="text-sm text-muted sm:ml-11">{{ row.remark }}</p>
                        </li>
                    </ul>
                </div>

                <template v-if="isEditable" #footer>
                    <div class="flex flex-col gap-2">
                        <UFormField label="Note to reviewer (optional)">
                            <UTextarea v-model="note" placeholder="Anything the admin should know before approving"
                                :rows="2" autoresize class="w-full" />
                        </UFormField>

                        <div class="flex justify-end">
                            <UButton :icon="PROMOTE_STUDENTS_ICON" label="Submit for Approval" :disabled="!canSubmit"
                                @click="confirmModal = true" />
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-else-if="!loading">
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                    <p class="text-gray-500 dark:text-gray-400">No active students to promote in this class.</p>
                </div>
            </UCard>
        </template>

        <UModal v-model:open="confirmModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">Submit for Approval</h3>
                    </template>

                    <div class="space-y-3">
                        <p class="text-sm text-muted">
                            You're about to submit this class's promotion decisions for review:
                        </p>

                        <ul class="space-y-1 text-sm">
                            <li><strong>{{ promoteCount }}</strong> students {{ promoteVerb.toLowerCase() }}{{
                                roster?.targetClassName
                                    && !isTerminalClass ? ` to ${roster.targetClassName}` : '' }}</li>
                            <li><strong>{{ repeatCount }}</strong> students repeating</li>
                        </ul>

                        <UAlert v-if="config?.requireApproval === false" color="warning" variant="soft"
                            icon="i-lucide-zap" title="This promotes students immediately"
                            description="This school's rules don't require admin approval - submitting moves every student's enrollment right away." />
                        <UAlert v-else color="info" variant="soft" icon="i-lucide-info" title="Nothing moves yet"
                            description="An admin or proprietor must approve this before any student's class actually changes." />
                    </div>

                    <template #footer>
                        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <UButton label="Cancel" variant="soft" color="neutral" :disabled="submitting"
                                @click="confirmModal = false" />
                            <UButton label="Submit for Approval" :loading="submitting" @click="submit" />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
