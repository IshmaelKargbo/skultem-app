<template>
  <div>
    <UCard v-if="selected" class="relative overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <!-- BANNER -->
      <div class="h-14 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10" />

      <UButton icon="lucide:x" size="sm" variant="soft" color="neutral" class="absolute top-3 right-3 rounded-full" @click="close" />

      <div class="space-y-6 px-5 pb-5">
        <!-- IDENTITY -->
        <div class="-mt-7 flex flex-wrap items-end justify-between gap-3">
          <div class="flex items-end gap-3">
            <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-default p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
              <div class="flex size-full items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="lucide:clipboard-check" class="size-6 text-primary-500" />
              </div>
            </div>

            <div class="min-w-0 pb-0.5">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                {{ selected.subject }} &middot; {{ selected.assessment }} &middot; {{ selected.term }}
              </p>
              <p class="text-lg font-bold text-highlighted">{{ selected.teacher }}</p>
              <p class="text-sm text-muted">{{ selected.class }}</p>
            </div>
          </div>

          <UBadge variant="subtle" size="lg" :color="statusColor(selected.status)" class="rounded-full">
            {{ statusLabel(selected.status) }}
          </UBadge>
        </div>

        <!-- STATS -->
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-2xl border border-default bg-elevated/40 p-3 text-center">
            <p class="text-lg font-bold text-highlighted">{{ selected.studentCount }}</p>
            <p class="text-xs text-muted">Students</p>
          </div>
          <div class="rounded-2xl border border-default bg-elevated/40 p-3 text-center">
            <p class="text-lg font-bold text-highlighted">{{ selected.avergeScore }}</p>
            <p class="text-xs text-muted">Avg Score</p>
          </div>
          <div class="rounded-2xl border border-default bg-elevated/40 p-3 text-center">
            <p class="text-lg font-bold text-highlighted">{{ selected.passPercentage }}%</p>
            <p class="text-xs text-muted">Pass Rate</p>
          </div>
        </div>

        <!-- GRADE DISTRIBUTION -->
        <div>
          <p class="mb-2 text-sm font-semibold text-highlighted">Grade Distribution</p>
          <GradeDistributionBar :average="selected.avgPercentage" :pass="selected.passPercentage"
            :fail="selected.failPercentage" />
        </div>

        <!-- TEACHER NOTE -->
        <div v-if="selected.note">
          <p class="mb-2 text-sm font-semibold text-highlighted">Teacher's Note</p>
          <div class="rounded-xl border border-default bg-elevated/40 p-3 text-sm text-muted">
            {{ selected.note }}
          </div>
        </div>

        <!-- STUDENT SCORES -->
        <div>
          <p class="mb-2 text-sm font-semibold text-highlighted">Student Scores</p>
          <div class="overflow-hidden rounded-xl border border-default">
            <table class="w-full text-sm">
              <thead class="bg-elevated/60 text-left">
                <tr>
                  <th class="p-2 font-medium text-muted">Student</th>
                  <th class="p-2 font-medium text-muted">Score</th>
                  <th class="p-2 text-right font-medium text-muted">Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in sortedStudentScores" :key="student.id" class="border-t border-default">
                  <td class="p-2">
                    <div class="flex items-center gap-2">
                      <UAvatar
                        size="xs"
                        :alt="student.student"
                        :text="studentInitials(student.student)"
                        class="shrink-0 ring-1 ring-default"
                      />
                      <span class="truncate text-highlighted">{{ student.student }}</span>
                    </div>
                  </td>
                  <td class="p-2 font-medium text-highlighted"> {{ student.score }} </td>
                  <td class="p-2 text-right">
                    <UBadge size="sm" variant="subtle" color="primary"> {{ student.grade }} </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="returnForm" class="mt-5">
            <UFormField label="Reason For Return">
              <UTextarea v-model="state.note" placeholder="Explain what needs to be corrected" class="w-full" :rows="2" autoresize />
            </UFormField>
            <div class="mt-3 flex gap-3">
              <UButton :loading="isReturnLoading" :disabled="!state.note" label="Confirm Return"
                color="error" class="flex flex-1 justify-center" @click="remove" />
              <UButton label="Cancel" variant="outline" color="neutral" @click="returnForm = false" />
            </div>
          </div>

          <div v-if="reopenForm" class="mt-5">
            <UFormField label="Reason For Reopening">
              <UTextarea v-model="state.reopenNote" placeholder="Why does this approved grade need editing again?" class="w-full" :rows="2" autoresize />
            </UFormField>
            <div class="mt-3 flex gap-3">
              <UButton :loading="isReopenLoading" :disabled="!state.reopenNote" label="Confirm Reopen"
                color="warning" class="flex flex-1 justify-center" @click="reopen" />
              <UButton label="Cancel" variant="outline" color="neutral" @click="reopenForm = false" />
            </div>
          </div>

          <div v-if="showAction" class="mt-3 flex gap-3 border-t border-default pt-3">
            <UButton icon="lucide:corner-up-left" variant="outline" color="neutral" size="xl"
              class="flex w-full justify-center" label="Return" @click="returnForm = true" />
            <UButton :loading="isApproveLoading" icon="lucide:check-circle" color="success" size="xl"
              class="flex w-full justify-center" label="Approve" @click="approve" />
          </div>

          <div v-if="canReopen && !reopenForm" class="mt-3 border-t border-default pt-3">
            <UButton icon="lucide:lock-open" variant="outline" color="warning" size="xl"
              class="flex w-full justify-center" label="Reopen for Editing" @click="reopenForm = true" />
            <p class="mt-2 text-center text-xs text-muted">
              Lets the teacher edit this already-approved grade again. Only works while the academic year is still open.
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-else class="flex h-100 w-full flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="flex size-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon name="lucide:inbox" class="text-2xl text-primary-500" />
        </div>
        <p class="text-xs text-muted">Select a grade submission to view details</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { record } = defineProps({
  record: { type: Object as () => AssessmentApprovalRequest | null }
})
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')
const isApproveLoading = ref(false)
const isReturnLoading = ref(false)
const isReopenLoading = ref(false)
const store = useAssessmentStore()
const { error: toastError, success: toastSuccess } = useNotify()
const { can } = useAuth()

const state = reactive({
  note: '',
  reopenNote: ''
})

const returnForm = ref(false)
const reopenForm = ref(false)
const showAction = computed(() => selected.value?.status === 'Pending Review' && !returnForm.value)
const canReopen = computed(() =>
  selected.value?.status === 'Approved'
  && can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR])
)
const sortedStudentScores = computed(() => {
  if (!selected.value?.studentScores) return []

  return [...selected.value.studentScores].sort((a, b) => b.score - a.score)
})

const open = ref(false)
const emit = defineEmits(["close", "refresh"])

watch(
  () => record,
  (newVal) => {
    if (newVal) open.value = true
    returnForm.value = false
    reopenForm.value = false
    state.note = ''
    state.reopenNote = ''
  }
)

const selected = computed(() => record)

const statusLabel = (status: string) => {
  if (status === 'Pending Review') return 'Pending Approval'
  return status
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Pending Review': return 'warning'
    case 'Approved': return 'success'
    case 'Returned': return 'error'
    default: return 'neutral'
  }
}

const studentInitials = (name: string) => {
  if (!name) return "S"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

async function approve() {
  try {
    if (!selected.value) return

    isApproveLoading.value = true
    await store.approveRequest(selected.value.id, "Grade approved successfully")
    toastSuccess("Assessment approved successfully")
    emit("refresh")
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to approve request')
  } finally {
    isApproveLoading.value = false
  }
}

async function remove() {
  try {
    if (!selected.value) return

    isReturnLoading.value = true
    await store.returnRequest(selected.value.id, state.note)
    toastSuccess("Assessment returned successfully")
    emit("refresh")
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
    returnForm.value = false
    state.note = ''
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to return request')
  } finally {
    isReturnLoading.value = false
  }
}

async function reopen() {
  try {
    if (!selected.value) return

    isReopenLoading.value = true
    await store.reopen(selected.value.teacherSubjectId, {
      assessmentId: selected.value.assessmentId,
      termId: selected.value.termId,
      note: state.reopenNote
    })
    toastSuccess("Assessment reopened for editing")
    emit("refresh")
    reopenForm.value = false
    state.reopenNote = ''
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to reopen assessment')
  } finally {
    isReopenLoading.value = false
  }
}

const close = () => {
  open.value = false
  emit("close")
}
</script>
