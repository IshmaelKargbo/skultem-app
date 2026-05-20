<template>
  <div>
    <div v-if="selected"
      class="p-6 space-y-6 relative w-full bg-white dark:bg-gray-900 overflow-y-auto border-2 rounded-xl border-gray-200 dark:border-gray-800">
      <!-- CLOSE BUTTON -->
      <UButton icon="prime:times" size="sm" variant="ghost" class="absolute top-3 right-3" @click="close" />
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase"> {{ selected.subject }} · {{ selected.assessment }} · {{
          selected.term
        }}</p>
        <p class="text-lg font-semibold"> {{ selected.teacher }} </p>
        <p class="text-sm text-gray-500 dark:text-gray-400"> {{ selected.class }} </p>
      </div>

      <!-- STATUS BADGE -->
      <UBadge variant="outline" :color="statusColor(selected.status)">
        {{ statusLabel(selected.status) }}
      </UBadge>

      <!-- STATS -->
      <div class="grid grid-cols-3 gap-3">
        <UCard>
          <p class="text-lg font-semibold">{{ selected.studentCount }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Students</p>
        </UCard>
        <UCard>
          <p class="text-lg font-semibold">{{ selected.avergeScore }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
        </UCard>
        <UCard>
          <p class="text-lg font-semibold">{{ selected.passPercentage }}%</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Pass Rate</p>
        </UCard>
      </div>

      <!-- GRADE DISTRIBUTION -->
      <div>
        <p class="text-sm font-medium mb-2">Grade Distribution</p>
        <GradeDistributionBar :average="selected.avgPercentage" :pass="selected.passPercentage"
          :fail="selected.failPercentage" />
      </div>

      <!-- TEACHER NOTE -->
      <div>
        <p class="text-sm font-medium mb-2">Teacher's Note</p>
        <div class="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
          {{ selected.note }}
        </div>
      </div>

      <!-- STUDENT SCORES -->
      <div>
        <p class="text-sm font-semibold mb-2">Student Scores</p>
        <div class="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/70 text-left">
              <tr>
                <th class="p-2">Student</th>
                <th class="p-2">Score</th>
                <th class="p-2 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in sortedStudentScores" :key="student.id" class="border-t border-gray-200 dark:border-gray-700">
                <td class="p-2">
                  <div class="flex items-center gap-2">
                    <UAvatar
                      size="xs"
                      :alt="student.student"
                      :text="studentInitials(student.student)"
                      class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                    />
                    <span class="truncate">{{ student.student }}</span>
                  </div>
                </td>
                <td class="p-2 font-medium"> {{ student.score }} </td>
                <td class="p-2 text-right">
                  <UBadge size="sm" variant="outline" color="primary"> {{ student.grade }} </UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-5" v-if="returnForm">
          <UFormField label="Reason For Return">
            <UTextarea v-model="state.note" placeholder="Explain what needs to be corrected" />
          </UFormField>
          <div class="flex space-x-3 mt-3">
            <UButton :loading="isReturnLoading" @click="remove" :disabled="!state.note" label="Confirm Return"
              color="error" class="flex justify-center flex-1" />
            <UButton @click="returnForm = false" label="Cancel" variant="outline" size="xl" />
          </div>
        </div>
        <div class="flex space-x-3 pt-3 border-t mt-3 border-gray-200 dark:border-gray-800" v-if="showAction">
          <UButton icon="lucide:corner-up-left" variant="outline" color="neutral" size="xl"
            class="w-full flex justify-center" label="Return" @click="returnForm = true" />
          <UButton :loading="isApproveLoading" @click="approve" icon="lucide:check-circle" color="success" size="xl"
            class="w-full flex justify-center" label="Approve" />
        </div>
      </div>
    </div>
    <UCard v-else class="w-full h-full flex flex-col items-center justify-center">
      <div class="flex flex-col items-center">
        <UIcon name="lucide:inbox" class="text-4xl mb-3" />
        <p class="text-xs">Select a grade submission to view details</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const { record } = defineProps({
  record: { type: Object as () => AssessmentApprovalRequest | null }
})
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')
const isApproveLoading = ref(false)
const isReturnLoading = ref(false)
const store = useAssessmentStore()
const { error: toastError, success: toastSuccess } = useNotify()

const state = reactive({
  note: ''
})

const returnForm = ref(false)
const showAction = computed(() => selected.value?.status === 'Pending Review' && !returnForm.value)
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

const close = () => {
  open.value = false
  emit("close")
}
</script>
