<template>
  <UForm :schema="schema" :state="state" class="space-y-3" @submit.prevent="onSubmit">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <!-- Header -->
      <template #header>
        <div class="flex items-center">
          <p class="text-lg font-normal hidden md:block flex-1">
            Mark Attendance
            <span v-if="state.date">for {{ formatDateString(state.date) }}</span>
            <span v-if="twoRollCalls" class="text-muted"> · {{ rollName(state.roll) }} roll call</span>
          </p>
          <div class="flex shrink-0 items-center"><GuideButton guide="teacher-attendance" /><HelpButton topic="teacher-attendance" /></div>

          <div data-guide="attendance-pick" class="flex-1 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            <UFormField name="classId" class="w-full">
              <USelect v-model="state.classId" :items="classes" placeholder="Select class" class="w-full"
                @change="onClassOrDateChange" />
            </UFormField>

            <UFormField name="date" class="w-full">
              <UInput v-model="state.date" :max="today" type="date" class="w-full" @change="onClassOrDateChange" />
            </UFormField>
          </div>
        </div>
      </template>

      <div>
        <!-- Two roll calls a day: pick which one is being taken. -->
        <div v-if="state.classId && twoRollCalls" data-guide="attendance-roll"
          class="flex flex-col gap-2 border-b border-default px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="grid grid-cols-2 gap-1 rounded-lg bg-elevated p-1 sm:w-80">
            <UButton v-for="n in [1, 2]" :key="n" size="sm" block :disabled="isLoading"
              :color="state.roll === n ? 'primary' : 'neutral'" :variant="state.roll === n ? 'solid' : 'ghost'"
              :icon="rollDone(n) ? 'lucide:check-circle' : undefined" :label="`${rollName(n)} roll call`"
              @click="pickRoll(n)" />
          </div>
          <p class="flex items-start gap-1.5 text-xs text-muted">
            <UIcon name="lucide:info" class="mt-0.5 size-3.5 shrink-0" />
            A student counts as present for the day only when present at both roll calls.
          </p>
        </div>

        <!-- Actions -->
        <div v-if="state.classId" data-guide="attendance-actions" class="flex space-x-3 border-b border-default py-4 bg-gray-50/40 dark:bg-gray-800 px-3">
          <UCheckbox v-if="report.holiday" v-model="state.holiday" size="xs" variant="card" color="info"
            label="Mark on Holiday" />

          <div class="flex space-x-3">
            <UButton size="sm" color="success" variant="subtle" label="Mark All Present" :disabled="isDisable"
              @click="markAllPresent" />
            <UButton size="sm" color="error" variant="subtle" label="Clear All" :disabled="isDisable"
              @click="clearAll" />
          </div>
        </div>


        <UTable data-guide="attendance-list" class="hidden md:block" :columns="columns" :data="isLoading ? skeletonRows : state.records"
          :loading="isLoading">
          <template #studentName-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar size="md" :src="row.original.photo || '/avatar-placeholder.svg'"
                :alt="row.original.studentName" loading="lazy" class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ row.original.studentName }}</p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ row.original.admissionNumber }}</p>
                <UBadge v-if="twoRollCalls" size="sm" variant="soft" class="mt-0.5"
                  :color="rollMarkColor(otherRollMark(row.original))">
                  {{ rollName(otherRoll) }}: {{ rollMarkLabel(otherRollMark(row.original)) }}
                </UBadge>
              </div>
            </div>
          </template>
          <template #present-cell="{ row }">
            <UCheckbox label="Present" size="xs" color="success" variant="card" :disabled="isDisable"
              :model-value="row.original.present" @change="stateChange(row.index, 'present')" />
          </template>
          <template #late-cell="{ row }">
            <UCheckbox label="Late" size="xs" color="warning" variant="card" :disabled="isDisable"
              :model-value="row.original.late" @change="stateChange(row.index, 'late')" />
          </template>
          <template #excused-cell="{ row }">
            <UCheckbox label="Excused" size="xs" color="secondary" variant="card" :disabled="isDisable"
              :model-value="row.original.excused" @change="stateChange(row.index, 'excused')" />
          </template>
          <template #reason-cell="{ row }">
            <UFormField :name="`records.${row.index}.reason`">
              <UInput v-model="row.original.reason" :disabled="!row.original.excused"
                :placeholder="row.original.excused ? 'Enter excuse reason...' : ''" />
            </UFormField>
          </template>
          <template v-if="isLoading" #studentName-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <template v-if="isLoading" #present-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <template v-if="isLoading" #late-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <template v-if="isLoading" #excused-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <template v-if="isLoading" #reason-cell>
            <USkeleton class="h-4 w-32" />
          </template>
        </UTable>

        <!-- Mobile Cards -->
        <div data-guide="attendance-list" class="divide-y divide-default md:hidden">

          <!-- Mobile Skeleton -->
          <template v-if="isLoading">
            <div v-for="i in skeletonRows.length" :key="i" class="p-3 space-y-3">
              <div class="flex items-center space-x-2">
                <USkeleton class="h-10 w-10 rounded-full shrink-0" />
                <div class="space-y-1.5 flex-1">
                  <USkeleton class="h-3.5 w-36" />
                  <USkeleton class="h-3 w-24" />
                </div>
              </div>
              <div class="flex space-x-2">
                <USkeleton class="h-7 w-20 rounded-md" />
                <USkeleton class="h-7 w-16 rounded-md" />
                <USkeleton class="h-7 w-20 rounded-md" />
              </div>
              <USkeleton class="h-8 w-full rounded-md" />
            </div>
          </template>

          <!-- Mobile Records -->
          <template v-else>
            <div v-for="(row, i) in state.records" :key="row.studentId" class="p-3 space-y-2">
              <div class="flex items-center space-x-2">
                <UAvatar :src="row.photo || '/avatar-placeholder.svg'" :alt="row.studentName" size="md"
                  loading="lazy" class="shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium leading-tight">{{ row.studentName }}</p>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ row.admissionNumber }}</p>
                </div>
                <UBadge v-if="twoRollCalls" size="sm" variant="soft" class="shrink-0"
                  :color="rollMarkColor(otherRollMark(row))">
                  {{ rollName(otherRoll) }}: {{ rollMarkLabel(otherRollMark(row)) }}
                </UBadge>
              </div>

              <div class="flex space-x-2">
                <UCheckbox label="Present" size="xs" color="success" variant="card" :disabled="isDisable"
                  :model-value="row.present" @change="stateChange(i, 'present')" />
                <UCheckbox label="Late" size="xs" color="warning" variant="card" :disabled="isDisable"
                  :model-value="row.late" @change="stateChange(i, 'late')" />
                <UCheckbox label="Excused" size="xs" color="secondary" variant="card" :disabled="isDisable"
                  :model-value="row.excused" @change="stateChange(i, 'excused')" />
              </div>

              <Transition name="fade">
                <UFormField v-if="row.excused" :name="`records.${i}.reason`">
                  <UInput v-model="row.reason" placeholder="Enter excuse reason..." class="w-full" />
                </UFormField>
              </Transition>
            </div>
          </template>

        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-end">
          <UButton data-guide="attendance-save" type="submit" icon="lucide:save" label="Save Attendance" :loading="isLoading" />
        </div>
      </template>
    </UCard>
  </UForm>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent, TableColumn } from '#ui/types'

const view = ref<'table' | 'card'>('table')
const classStore = useClassSessionStore()
const store = useAttendanceStore()

const skeletonRows = Array(runtimeConf().limit).fill({})
const router = useRouter()
const route = useRoute()
const today = todayISO()
const { error, success } = useNotify()

const { report, rollCalls } = storeToRefs(store)
const twoRollCalls = computed(() => rollCalls.value === 2)

const isLoading = ref(false)
const records = ref<ClassSession[]>([])
const selectedClass = ref<ClassSession>()

type AttendanceRowRecord = {
  attendanceId: string
  studentName: string
  studentId: string
  admissionNumber: string
  photo?: string | null
  present: boolean
  late: boolean
  excused: boolean
  reason: string
  marked?: boolean
  firstRoll?: RollMark | null
  secondRoll?: RollMark | null
}

type AttendanceForm = {
  classId: string
  records: AttendanceRowRecord[]
  date: string
  holiday: boolean
  // Which roll call is being taken - only used when the class takes two a day.
  roll: number
}

const state = reactive<AttendanceForm>({
  classId: '',
  date: todayISO(),
  records: [],
  holiday: false,
  roll: 1
})

// Set once the teacher (or the link) has chosen a roll call, so we stop picking one for them.
const rollChosen = ref(false)

const rollName = (n: number) => (n === 1 ? '1st' : '2nd')
const otherRoll = computed(() => (state.roll === 1 ? 2 : 1))
const otherRollMark = (r: AttendanceRowRecord) => (otherRoll.value === 1 ? r.firstRoll : r.secondRoll) ?? null

function rollMarkLabel(m: RollMark | null) {
  if (!m) return 'Not taken'
  return { PRESENT: 'Present', LATE: 'Late', EXCUSED: 'Excused', ABSENT: 'Absent' }[m]
}

function rollMarkColor(m: RollMark | null) {
  if (!m) return 'neutral' as const
  return ({ PRESENT: 'success', LATE: 'warning', EXCUSED: 'secondary', ABSENT: 'error' } as const)[m]
}

// A roll call is done when every student has a mark for it.
function rollDone(n: number) {
  return state.records.length > 0
    && state.records.every(r => (n === 1 ? r.firstRoll : r.secondRoll) != null)
}

async function pickRoll(n: number) {
  if (state.roll === n) return
  rollChosen.value = true
  state.roll = n
  await fetchRecords()
}

const classes = computed(() =>
  records.value.map((e: ClassSession) => {
    let label = `${e.clazz} (${e.sectionName})`

    if (e.streamName !== 'N/A') {
      label = `${e.clazz} (${e.sectionName} - ${e.streamName})`
    }

    return {
      label,
      value: e.id
    }
  })
)

function updateQuery() {
  router.replace({
    query: {
      class: state.classId,
      date: state.date,
      ...(twoRollCalls.value ? { roll: String(state.roll) } : {})
    }
  })
}

const columns: TableColumn<AttendanceRowRecord>[] = [
  { accessorKey: 'studentName', header: 'Student' },
  { accessorKey: 'present', header: 'Present' },
  { accessorKey: 'late', header: 'Late' },
  { accessorKey: 'excused', header: 'Excused' },
  { accessorKey: 'reason', header: 'Reason' }
]

const isDisable = computed(() =>
  report.value.holiday && !state.holiday
)

function calculateReport(checkAbsent = false) {
  let present = 0
  let late = 0
  let excused = 0
  let absent = 0

  state.records.forEach(r => {
    if (r.present) present++
    else if (r.late) late++
    else if (r.excused) excused++
    else if (checkAbsent) absent++
  })

  store.updateReport({
    present,
    late,
    excused,
    absent,
    marked: state.records.length,
    rate: 0,
    holiday: false
  })
}

function stateChange(index: number, type: 'present' | 'late' | 'excused') {
  const r = state.records[index]
  if (!r) return

  if (r[type]) {
    r.present = false
    r.late = false
    r.excused = false
    r.reason = ''
    return
  }

  r.present = type === 'present'
  r.late = type === 'late'
  r.excused = type === 'excused'

  if (!r.excused) r.reason = ''

  calculateReport()
}

function markAllPresent() {
  state.records.forEach(r => {
    r.present = true
    r.late = false
    r.excused = false
    r.reason = ''
  })
  calculateReport()
}

function clearAll() {
  state.records.forEach(r => {
    r.present = false
    r.late = false
    r.excused = false
    r.reason = ''
  })
  calculateReport()
}

async function fetchRecords() {
  selectedClass.value = records.value.find(
    e => e.id === state.classId
  )

  if (!selectedClass.value) return

  scrollToTop()
  isLoading.value = true

  try {
    updateQuery()

    state.records = await store.getSession(
      selectedClass.value.id,
      state.date,
      state.roll
    )

    // Opening a day where the 1st roll call is finished and the 2nd isn't: go straight to the 2nd.
    if (twoRollCalls.value && !rollChosen.value && state.roll === 1 && rollDone(1) && !rollDone(2)) {
      rollChosen.value = true
      state.roll = 2
      updateQuery()
      state.records = await store.getSession(selectedClass.value.id, state.date, state.roll)
    }

    state.holiday = report.value.holiday

    await store.fetchAll(selectedClass.value.id)

  } finally {
    isLoading.value = false
  }
}

// A new class or day starts on the 1st roll call (or the 2nd, if the 1st is already done).
function onClassOrDateChange() {
  rollChosen.value = false
  state.roll = 1
  fetchRecords()
}

function scrollToTop() {
  document.getElementById('attendance-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
}

const schema = yup.object({
  classId: yup.string().required('Class is required'),
  date: yup.string().required('Date is required'),

  records: yup.array().of(
    yup.object({
      present: yup.boolean(),
      late: yup.boolean(),
      excused: yup.boolean(),
      reason: yup.string().when('excused', {
        is: true,
        then: s => s.required().min(3),
        otherwise: s => s.notRequired()
      })
    })
  )
})

async function onSubmit(event: FormSubmitEvent<AttendanceForm>) {
  if (!selectedClass.value) return

  isLoading.value = true

  try {
    const attendanceRecords: AttendanceRecord[] = state.records.map(r => ({
      studentId: r.studentId,
      present: r.present,
      late: r.late,
      excused: r.excused,
      reason: r.reason
    }))

    await store.create(selectedClass.value.id, {
      date: state.date,
      records: attendanceRecords,
      holiday: state.holiday,
      ...(twoRollCalls.value ? { roll: state.roll } : {})
    })

    success(twoRollCalls.value
      ? `${rollName(state.roll)} roll call saved`
      : 'Attendance saved successfully')

    calculateReport(true)
    fetchRecords()

  } catch (err) {
    error('Something went wrong')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const res = await classStore.fetchAllMe()
  records.value = res

  state.classId =
    (route.query.class as string) ||
    records.value[0]?.id ||
    ''

  state.date =
    (route.query.date as string) ||
    todayISO()

  const queryRoll = Number(route.query.roll)
  if (queryRoll === 1 || queryRoll === 2) {
    state.roll = queryRoll
    rollChosen.value = true
  }

  if (state.classId) {
    await fetchRecords()
  }
})

watch(
  () => route.query,
  async (query) => {
    const classId = query.class as string
    const date = query.date as string

    if (!classId || !date) return

    if (classId !== state.classId || date !== state.date) {
      state.classId = classId
      state.date = date

      await fetchRecords()
    }
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
