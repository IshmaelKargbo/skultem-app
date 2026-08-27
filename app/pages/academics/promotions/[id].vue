<script lang="ts" setup>
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useNotify()

const id = computed(() => String(route.params.id))

const loading = ref(true)
const deciding = ref(false)
const detail = ref<PromotionRequest | null>(null)
const config = ref<PromotionConfig | null>(null)
const decisionNote = ref('')

const allowToPass = ref<Set<string>>(new Set())

const isPending = computed(() => detail.value?.status === 'PENDING_REVIEW')
const passMark = computed(() => config.value?.minPassMark ?? null)

const isTerminal = computed(() => detail.value?.targetClassName === 'Graduation')
const promoteLabel = computed(() => isTerminal.value ? 'Graduate' : 'Promote')
const promoteVerb = computed(() => isTerminal.value ? 'Graduating' : 'Promoting')

const sortedItems = computed(() => {
    if (!detail.value) return []

    // Passed first (highest average leading), then failed, each group sorted best-to-worst average -
    // a student allowed to pass is grouped with the promotes since that's the decision that stands.
    const rank = (item: PromotionRequestItem) =>
        allowToPass.value.has(item.enrollmentId) || item.outcome === 'PROMOTE' ? 0 : 1

    return [...detail.value.items].sort((a, b) => {
        const rankDiff = rank(a) - rank(b)
        if (rankDiff !== 0) return rankDiff

        if (a.average == null && b.average == null) return 0
        if (a.average == null) return 1
        if (b.average == null) return -1
        return b.average - a.average
    })
})

function toggleAllowToPass(enrollmentId: string) {
    const next = new Set(allowToPass.value)
    if (next.has(enrollmentId)) next.delete(enrollmentId)
    else next.add(enrollmentId)
    allowToPass.value = next
}

async function load() {
    loading.value = true
    try {
        const [requestRes, configRes] = await Promise.all([
            PromotionApi().getPromotionRequest(id.value),
            PromotionApi().getPromotionConfig()
        ])
        detail.value = requestRes || null
        config.value = configRes || null
        decisionNote.value = ''
        allowToPass.value = new Set()
    } finally {
        loading.value = false
    }
}

async function approve() {
    if (!detail.value) return

    deciding.value = true
    try {
        const res = await PromotionApi().approvePromotionRequest(
            detail.value.id,
            decisionNote.value.trim() || undefined,
            allowToPass.value.size ? [...allowToPass.value] : undefined
        )
        if (res) {
            toastSuccess(`Promotion approved: ${res.promotedCount} promoted, ${res.repeatedCount} repeating`)
            await load()
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to approve promotion')
    } finally {
        deciding.value = false
    }
}

async function returnForChanges() {
    if (!detail.value) return

    if (!decisionNote.value.trim()) {
        toastError('A reason is required to return this submission')
        return
    }

    deciding.value = true
    try {
        const res = await PromotionApi().returnPromotionRequest(detail.value.id, decisionNote.value.trim())
        if (res) {
            toastSuccess('Returned to the class master for changes')
            await load()
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to return promotion')
    } finally {
        deciding.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Review Promotion')
    document.title = 'Review Promotion | Skultem'
    load()
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <!-- Banner -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div
                class="h-16 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-20" />

            <div class="px-5 pb-5">
                <div class="-mt-8 flex flex-col gap-4 md:-mt-9 md:flex-row md:items-center md:justify-between">
                    <div class="flex min-w-0 items-center gap-4">
                        <div
                            class="shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <div class="flex size-14 items-center justify-center rounded-xl bg-primary/10 md:size-16">
                                <UIcon :name="PROMOTE_STUDENTS_ICON" class="size-6 text-primary md:size-7" />
                            </div>
                        </div>

                        <div class="min-w-0 pb-0.5">
                            <USkeleton v-if="loading" class="h-6 w-48" />
                            <h2 v-else class="truncate text-xl font-bold tracking-tight text-highlighted">
                                {{ detail?.sessionName || 'Promotion Request' }}
                            </h2>
                            <p v-if="!loading" class="text-sm text-muted">
                                {{ detail?.classMasterName }} &middot; {{ detail?.academicYearName }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <UBadge v-if="detail" :label="promotionRequestStatusStyle[detail.status].label"
                            :color="promotionRequestStatusStyle[detail.status].color" variant="subtle" size="lg" />
                    </div>
                </div>
            </div>
        </UCard>

        <div v-if="loading" class="space-y-3">
            <USkeleton class="h-20 w-full rounded-xl" />
            <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
        </div>

        <template v-else-if="detail">
            <UAlert v-if="detail.teacherNote" color="info" variant="soft" icon="i-lucide-message-square"
                title="Note from class master" :description="detail.teacherNote" />

            <UAlert v-if="detail.returnReason" color="error" variant="soft" icon="i-lucide-corner-up-left"
                title="Returned" :description="detail.returnReason" />

            <UAlert v-if="detail.approvalNote" color="success" variant="soft" icon="i-lucide-check-circle-2"
                title="Approval note" :description="detail.approvalNote" />

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric :record="{
                    label: promoteVerb,
                    color: 'success',
                    icon: 'i-lucide-graduation-cap',
                    isReady: !loading,
                    value: detail.promoteCount,
                    subtle: detail.targetClassName || 'next class'
                }" />
                <Metric :record="{
                    label: 'Repeating',
                    color: 'error',
                    icon: 'i-lucide-rotate-ccw',
                    isReady: !loading,
                    value: detail.repeatCount,
                    subtle: 'Repeating students'
                }" />
                <Metric :record="{
                    label: 'Total Students',
                    color: 'info',
                    icon: STUDENT_ICON,
                    isReady: !loading,
                    value: detail.items.length,
                    subtle: 'Total students'
                }" />
            </div>

            <!-- Students - full page so a large class is easy to scroll and review -->
            <UCard :ui="{ body: 'p-0 sm:p-0' }">
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <h3 class="font-semibold">Students</h3>
                        <p v-if="isPending" class="text-xs text-muted">
                            Use <strong>Allow to {{ promoteLabel }}</strong> to override a Repeat without returning the
                            whole request
                        </p>
                    </div>
                </template>

                <ul class="divide-y divide-default">
                    <li v-for="item in sortedItems" :key="item.studentId"
                        class="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div class="flex min-w-0 items-center gap-3">
                            <UAvatar :alt="item.studentName" size="xl" />

                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <p class="truncate font-medium text-highlighted">{{ item.studentName }}</p>
                                    <span v-if="item.average != null" class="text-xs"
                                        :class="passMark != null && item.average < passMark ? 'text-error font-medium' : 'text-success font-medium'">
                                        {{ Math.round(item.average) }}% average
                                    </span>
                                </div>
                                <p class="truncate text-xs text-muted">Admission No. {{ item.admissionNumber }}</p>
                                <p v-if="item.remark" class="max-w-md truncate text-xs-base text-muted">{{ item.remark
                                }}</p>
                                <p v-if="item.targetStreamName" class="text-xs-base text-mute">Stream: {{
                                    item.targetStreamName }}</p>
                            </div>
                        </div>

                        <div class="flex shrink-0 items-center gap-2">
                            <UBadge v-if="allowToPass.has(item.enrollmentId)" color="success" variant="subtle"
                                icon="i-lucide-check">
                                Allowed to {{ promoteLabel }}
                            </UBadge>
                            <UBadge v-else :color="item.outcome === 'PROMOTE' ? 'success' : 'warning'" variant="subtle">
                                {{ item.outcome === 'PROMOTE' ? promoteLabel : 'Repeat' }}
                            </UBadge>

                            <UButton v-if="isPending && item.outcome === 'REPEAT'" size="xs"
                                :variant="allowToPass.has(item.enrollmentId) ? 'solid' : 'soft'"
                                :color="allowToPass.has(item.enrollmentId) ? 'success' : 'neutral'"
                                :label="allowToPass.has(item.enrollmentId) ? 'Undo' : `Allow to ${promoteLabel}`"
                                @click="toggleAllowToPass(item.enrollmentId)" />
                        </div>
                    </li>
                </ul>

                <template v-if="isPending" #footer>
                    <div class="flex flex-col gap-3">
                        <UFormField label="Note (required to return, optional to approve)">
                            <UTextarea v-model="decisionNote" :rows="2" autoresize class="w-full"
                                placeholder="Add a note for the class master" />
                        </UFormField>

                        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <UButton label="Return" variant="soft" color="error" :loading="deciding"
                                @click="returnForChanges" />
                            <UButton
                                :label="allowToPass.size ? `Approve (${allowToPass.size} allowed to ${promoteLabel.toLowerCase()})` : 'Approve'"
                                color="success" :loading="deciding" @click="approve" />
                        </div>
                    </div>
                </template>
            </UCard>
        </template>
    </div>
</template>
