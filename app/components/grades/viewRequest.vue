<template>
  <transition name="slide-over" appear>
    <div v-if="open && selected" class="p-6 space-y-6 relative md:w-1/2 w-full bg-white overflow-y-auto border-l border-gray-300">
      <!-- CLOSE BUTTON -->
      <UButton icon="prime:times" size="sm" variant="ghost" class="absolute top-3 right-3" @click="close" />

      <!-- HEADER -->
      <div>
        <p class="text-xs text-gray-500 uppercase"> {{ selected.subject }} · {{ selected.assessment }} · {{ selected.term }}</p>
        <p class="text-lg font-semibold"> {{ selected.teacher }} </p>
        <p class="text-sm text-gray-500"> {{ selected.class }} </p>
      </div>

      <!-- STATUS BADGE -->
      <UBadge variant="outline" :color="statusColor(selected.status)">
        {{ statusLabel(selected.status) }}
      </UBadge>

      <!-- STATS -->
      <div class="grid grid-cols-3 gap-3">
        <UCard>
          <p class="text-lg font-semibold">{{ selected.studentCount }}</p>
          <p class="text-xs text-gray-500">Students</p>
        </UCard>
        <UCard>
          <p class="text-lg font-semibold">{{ selected.avergeScore }}</p>
          <p class="text-xs text-gray-500">Avg Score</p>
        </UCard>
        <UCard>
          <p class="text-lg font-semibold">{{ selected.passPercentage }}%</p>
          <p class="text-xs text-gray-500">Pass Rate</p>
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
        <div class="bg-white border border-gray-300 rounded-lg p-3 text-sm">
          {{ selected.note }}
        </div>
      </div>

      <!-- STUDENT SCORES -->
      <div>
        <p class="text-sm font-semibold mb-2">Student Scores</p>
        <div class="bg-white border border-gray-300 rounded-md overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="p-2">Student</th>
                <th class="p-2">Score</th>
                <th class="p-2 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in sortedStudentScores" :key="student.id" class="border-t border-gray-300">
                <td class="p-2">{{ student.student }}</td>
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
        <div class="flex space-x-3 pt-3 border-t mt-3 border-gray-200" v-if="showAction">
          <UButton icon="lucide:corner-up-left" variant="outline" color="neutral" size="xl"
            class="w-full flex justify-center" label="Return" @click="returnForm = true" />
          <UButton :loading="isApproveLoading" @click="approve" icon="lucide:check-circle"
            color="success" size="xl" class="w-full flex justify-center" label="Approve" />
        </div>
      </div>
    </div>
  </transition>
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
const {error: toastError, success: toastSuccess} = useNotify()

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

<style scoped>
.slide-over-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-over-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-over-enter-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-over-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-over-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-over-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
