<template>
  <div>
    <UCard v-if="selected" class="relative overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <!-- BANNER -->
      <div class="h-14 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10" />

      <UButton icon="lucide:x" size="sm" variant="soft" color="neutral" class="absolute md:hidden top-3 right-3 rounded-full" @click="close" />

      <div class="space-y-6 px-5 pb-5">
        <!-- IDENTITY -->
        <div class="-mt-7 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-end gap-3">
            <div class="min-w-0 pb-0.5">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                {{ selected.subject }} &middot; {{ selected.clazz }}  &middot; {{ selected.assessment }} &middot; {{ selected.term }}
              </p>
              <p class="text-lg font-bold text-highlighted">{{ selected.teacher }}</p>
              <p class="text-sm text-muted">{{ selected.clazz }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <GuideButton guide="exam-office-approval-review" /><HelpButton topic="exam-office-approval-review" />
            <UBadge data-guide="review-status" variant="subtle" size="lg" :color="statusColor(selected.status)" class="rounded-full">
              {{ statusLabel(selected.status) }}
            </UBadge>
          </div>
        </div>

        <!-- RESULTS: the pass rate as a ring, the other figures beside it, passed vs below as one bar. -->
        <div data-guide="review-stats" class="rounded-2xl border border-default p-4">
          <div class="flex flex-col items-center gap-5 sm:flex-row">
            <div class="relative size-28 shrink-0" role="img"
              :aria-label="`${Math.round(passRate)}% of students passed`">
              <svg viewBox="0 0 120 120" class="size-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" :class="rateTone.track" stroke="currentColor" />
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" stroke-linecap="round" stroke="currentColor"
                  :class="rateTone.ring" class="transition-[stroke-dashoffset] duration-1000 ease-out"
                  :stroke-dasharray="RING" :stroke-dashoffset="ringOffset" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-extrabold" :class="rateTone.text">{{ Math.round(passRate) }}%</span>
                <span class="text-[11px] text-muted">passed</span>
              </div>
            </div>
            <div class="w-full flex-1 space-y-2.5">
              <div v-for="stat in resultStats" :key="stat.label" class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg" :class="stat.box">
                  <UIcon :name="stat.icon" class="size-4" />
                </span>
                <span class="flex-1 text-sm text-muted">{{ stat.label }}</span>
                <span class="text-lg font-bold text-highlighted">{{ stat.value }}<span v-if="stat.suffix"
                    class="text-xs font-normal text-muted">{{ stat.suffix }}</span></span>
              </div>
            </div>
          </div>
          <div v-if="passCount + failCount > 0" data-guide="review-distribution" class="mt-4">
            <div class="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              <div v-if="passCount" class="bg-success" :style="{ flexGrow: passCount }" />
              <div v-if="failCount" class="bg-error" :style="{ flexGrow: failCount }" />
            </div>
            <div class="mt-1.5 flex justify-between text-xs font-semibold">
              <span class="text-success">{{ passCount }} passed</span>
              <span class="text-error">{{ failCount }} below the pass mark</span>
            </div>
          </div>
        </div>

        <!-- TEACHER NOTE -->
        <div v-if="selected.note">
          <p class="mb-2 text-sm font-semibold text-highlighted">Teacher's Note</p>
          <div class="rounded-xl border border-default bg-elevated/40 p-3 text-sm text-muted">
            {{ selected.note }}
          </div>
        </div>

        <!-- CA + FORMAL TEST INSIGHT: only for a section using continuous assessment -->
        <!-- Prompts for the approver: CA patterns worth a second look before signing off. -->
        <div v-if="isContinuous" data-guide="review-flags"><GradesCaReviewFlags :scores="selected.studentScores ?? []" /></div>
        <GradesTeacherCaInsight v-if="isContinuous" :assessment="insightAssessment" :rows="insightRows" />

        <!-- STUDENT SCORES -->
        <div data-guide="review-scores">
          <p class="mb-2 text-sm font-semibold text-highlighted">Student Scores</p>
          <!-- Phone, continuous assessment: a card per student (CA + formal test don't fit as table columns). -->
          <div v-if="isContinuous" class="space-y-2 md:hidden">
            <div v-for="(student, i) in sortedStudentScores" :key="student.id" class="rounded-xl border p-3"
              :class="isFail(student) ? 'border-error/30 bg-error/5' : 'border-default'">
              <div class="flex items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-2.5">
                  <span class="w-5 shrink-0 text-xs font-bold text-muted">{{ i + 1 }}</span>
                  <UAvatar size="md" :src="student.studentPhoto || undefined" :alt="student.student" :text="studentInitials(student.student)"
                    class="shrink-0 ring-1 ring-default" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-highlighted">{{ student.student }}</p>
                    <p v-if="student.admissionNumber" class="truncate text-xs text-muted">{{ student.admissionNumber }}</p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <UBadge size="sm" variant="subtle" :color="gradeColor(student)">{{ student.grade }}</UBadge>
                  <span class="text-lg font-bold" :class="isFail(student) ? 'text-error' : 'text-highlighted'">{{ student.score }}</span>
                </div>
              </div>
              <GradesCaBreakdown class="mt-2" :grade="student" />
            </div>
          </div>

          <div class="overflow-hidden rounded-xl border border-default" :class="isContinuous ? 'hidden md:block' : ''">
            <table class="w-full text-sm">
              <thead class="bg-elevated/60 text-left">
                <tr>
                  <th class="w-10 p-2 font-medium text-muted">#</th>
                  <th class="p-2 font-medium text-muted">Student</th>
                  <th v-if="isContinuous" class="p-2 font-medium text-muted">CA</th>
                  <th v-if="isContinuous" class="p-2 font-medium text-muted">Test</th>
                  <th class="p-2 font-medium text-muted">Score</th>
                  <th class="p-2 text-right font-medium text-muted">Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, i) in sortedStudentScores" :key="student.id" class="border-t border-default"
                  :class="isFail(student) ? 'bg-error/5' : ''">
                  <td class="p-2 text-xs font-bold text-muted">{{ i + 1 }}</td>
                  <td class="p-2">
                    <div class="flex items-center gap-2.5">
                      <UAvatar
                        size="md"
                        :src="student.studentPhoto || undefined"
                        :alt="student.student"
                        :text="studentInitials(student.student)"
                        class="shrink-0 ring-1 ring-default"
                      />
                      <span class="min-w-0">
                        <span class="block truncate font-medium text-highlighted">{{ student.student }}</span>
                        <span v-if="student.admissionNumber" class="block truncate text-xs text-muted">{{ student.admissionNumber }}</span>
                      </span>
                      <UBadge v-if="isContinuous && trendOf(student).trend !== 'not-enough-data'" size="sm" variant="subtle"
                        :color="trendOf(student).trend === 'improving' ? 'success' : trendOf(student).trend === 'declining' ? 'error' : 'neutral'"
                        :icon="trendOf(student).trend === 'improving' ? 'lucide:trending-up' : trendOf(student).trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'">
                        {{ CA_TREND_LABEL[trendOf(student).trend] }}
                      </UBadge>
                    </div>
                  </td>
                  <td v-if="isContinuous" class="p-2">
                    <template v-if="student.continuous">
                      <p class="font-medium text-highlighted">
                        {{ student.continuous.caScore ?? '-' }}
                        <span v-if="student.continuous.caPercentage === 0" class="text-xs text-muted">(monitoring only)</span>
                        <span v-else class="text-xs text-muted">({{ student.continuous.caPoints }}/{{ student.continuous.caPercentage }})</span>
                      </p>
                      <p class="text-[11px] text-muted whitespace-nowrap">
                        {{ student.continuous.caEntryScores.map(v => v ?? '-').join(' · ') }}
                      </p>
                    </template>
                  </td>
                  <td v-if="isContinuous" class="p-2">
                    <template v-if="student.continuous">
                      <p class="font-medium text-highlighted">
                        {{ student.continuous.formalScore ?? '-' }}
                        <span class="text-xs text-muted">({{ student.continuous.formalPoints }}/{{ student.continuous.formalPercentage }})</span>
                      </p>
                    </template>
                  </td>
                  <td class="p-2 font-bold" :class="isFail(student) ? 'text-error' : 'text-highlighted'"> {{ student.score }} </td>
                  <td class="p-2 text-right">
                    <UBadge size="sm" variant="subtle" :color="gradeColor(student)"> {{ student.grade }} </UBadge>
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

          <UAlert v-if="needsOtherReviewer && selected.approver === 'ADMIN'" class="mt-3" color="info" variant="subtle"
            icon="lucide:shield-check" title="An admin approves grades for this class"
            description="Your school has an admin approve grades for this class, so this is waiting for an admin, proprietor or owner. You'll see it here once it's approved or returned." />
          <UAlert v-else-if="needsOtherReviewer && selected.approver === 'EXAM_OFFICER'" class="mt-3" color="info"
            variant="subtle" icon="lucide:shield-check" title="The exam officer approves grades for this class"
            description="Your school sends grades for this class to the exam office, so this is waiting for the exam officer (an admin, proprietor or owner can also step in)." />
          <UAlert v-else-if="needsOtherReviewer && isExamOfficer" class="mt-3" color="info" variant="subtle"
            icon="lucide:shield-check" title="The class master approves grades for this class"
            description="Your school has the class master approve grades here, so the exam office only follows it. To have them come to you, set 'Who approves grades?' to the exam officer in School Settings." />
          <UAlert v-else-if="needsOtherReviewer" class="mt-3" color="info" variant="subtle" icon="lucide:shield-check"
            title="An admin or proprietor approves this one"
            description="You teach this subject as well as being the class master, so you can't approve your own grades. It is waiting for an admin, proprietor or owner." />
          <UAlert v-else-if="selected.requiresAdminReview && selected.status === 'Pending Review' && !isExamOfficer" class="mt-3"
            color="info" variant="subtle" icon="lucide:shield-check"
            :title="approverTitle"
            :description="approverDescription" />

          <div v-if="showAction" data-guide="review-actions" class="mt-3 flex gap-3 border-t border-default pt-3">
            <UButton icon="lucide:corner-up-left" variant="outline" color="neutral" size="xl"
              class="flex w-full justify-center" label="Return" @click="returnForm = true" />
            <UButton :loading="isApproveLoading" icon="lucide:check-circle" color="success" size="xl"
              class="flex w-full justify-center" label="Approve" @click="approve" />
          </div>

          <div v-if="canReopen && !reopenForm" data-guide="review-reopen" class="mt-3 border-t border-default pt-3">
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
const isManagement = computed(() => can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR]))
const isExamOfficer = computed(() => can(Role.EXAM_OFFICER))
// Who may act depends on the school's (or section's) grade approver: the class master, an admin or the exam
// officer. Admins, proprietors and owners can always step in. A class master who taught the subject can't approve
// their own grades - those go to an admin/proprietor/owner.
const needsOtherReviewer = computed(() => {
  if (selected.value?.status !== 'Pending Review' || isManagement.value) return false
  if (isExamOfficer.value) return selected.value?.approver !== 'EXAM_OFFICER'
  return !!selected.value?.requiresAdminReview
})
const showAction = computed(() =>
  selected.value?.status === 'Pending Review' && !returnForm.value && !needsOtherReviewer.value)
const canReopen = computed(() =>
  selected.value?.status === 'Approved'
  && can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.EXAM_OFFICER])
)
const approverTitle = computed(() => selected.value?.approver === 'ADMIN' ? 'Grades are approved by an admin'
  : selected.value?.approver === 'EXAM_OFFICER' ? 'Grades are approved by the exam officer'
    : 'Class master taught this subject')
const approverDescription = computed(() => selected.value?.approver === 'ADMIN'
  ? 'In this class the admin approves grades rather than the class master.'
  : selected.value?.approver === 'EXAM_OFFICER'
    ? 'In this class the exam office approves grades. You can still step in and approve or return it.'
    : 'The class master is also the subject teacher here, so it comes to you for approval.')
const sortedStudentScores = computed(() => {
  if (!selected.value?.studentScores) return []

  return [...selected.value.studentScores].sort((a, b) => b.score - a.score)
})

// Continuous assessment (CA + formal test): each score carries its breakdown, so the reviewer can see how the class
// and each student did, not just the final number.
const isContinuous = computed(() => !!selected.value?.studentScores?.some(s => s.continuous))
const insightAssessment = computed(() => ({ id: selected.value?.assessmentId ?? '', name: selected.value?.assessment ?? '' }) as Assessment)
const insightRows = computed(() => (selected.value?.studentScores ?? []).map(s => ({
  id: s.id,
  name: s.student,
  scores: [{ assessment: selected.value?.assessmentId, continuous: s.continuous }]
})) as unknown as StudentAssessment[])
const trendOf = (s: AssessmentScore) => caTrendOf(s.continuous?.caEntryScores ?? [])

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

// ---- Results at a glance, as in the mobile app.
const RING = 2 * Math.PI * 50
const passCount = computed(() => selected.value?.pass ?? 0)
const failCount = computed(() => selected.value?.fail ?? 0)
const passRate = computed(() => Math.min(100, Math.max(0, selected.value?.passPercentage ?? 0)))
// Drawn in as the request opens: starts empty, then fills to the pass rate.
const drawn = ref(0)
watch(passRate, (v) => {
  drawn.value = 0
  requestAnimationFrame(() => requestAnimationFrame(() => { drawn.value = v }))
}, { immediate: true })
const ringOffset = computed(() => RING * (1 - drawn.value / 100))
// Green when most pass, amber when it's close, red when most fail.
const rateTone = computed(() => passRate.value >= 70
  ? { ring: 'text-success', track: 'text-success/15', text: 'text-success' }
  : passRate.value >= 50
    ? { ring: 'text-warning', track: 'text-warning/15', text: 'text-warning' }
    : { ring: 'text-error', track: 'text-error/15', text: 'text-error' })
const resultStats = computed(() => [
  { label: 'Students', value: selected.value?.studentCount ?? 0, icon: 'lucide:users', box: 'bg-info/10 text-info' },
  { label: 'Class average', value: Math.round(selected.value?.avergeScore ?? 0), suffix: '/100', icon: 'lucide:chart-no-axes-column', box: 'bg-primary/10 text-primary' },
  { label: 'Passed', value: passCount.value, icon: 'lucide:circle-check', box: 'bg-success/10 text-success' },
  { label: 'Below the pass mark', value: failCount.value, icon: 'lucide:circle-x', box: 'bg-error/10 text-error' }
])
// A failing mark stands out in the list.
const isFail = (s: AssessmentScore) => s.passed === false
const gradeColor = (s: AssessmentScore) => isFail(s) ? 'error' as const : s.score >= 70 ? 'success' as const : 'info' as const

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
