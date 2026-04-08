<template>
  <UForm :schema="schema" :state="state" class="space-y-3" @submit.prevent="onSubmit">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <!-- Header -->
      <template #header>
        <div class="flex items-center">
          <p class="text-lg font-normal hidden md:block flex-1">
            Mark Attendance
            <span v-if="state.date">for {{ formatDateString(state.date) }}</span>
          </p>

          <div class="flex flex-1 md:space-x-5 space-x-3">
            <UFormField name="classId" class="w-full">
              <USelect v-model="state.classId" :items="classes" placeholder="Select class" @change="fetchRecords" />
            </UFormField>

            <UFormField name="date" class="w-full">
              <UInput v-model="state.date" type="date" @change="fetchRecords" />
            </UFormField>
          </div>
        </div>
      </template>

      <div v-if="state.classId">
        <!-- Actions -->
        <div class="flex space-x-3 border-b border-gray-200 py-4 bg-gray-50/40 px-3">

          <UCheckbox v-if="report.holiday" v-model="state.holiday" size="xs" variant="card" color="info"
            label="Mark on Holiday" />

          <div class="flex space-x-3">
            <UButton size="sm" color="success" variant="subtle" label="Mark All Present" :disabled="isDisable"
              @click="markAllPresent" />

            <UButton size="sm" color="error" variant="subtle" label="Clear All" :disabled="isDisable"
              @click="clearAll" />
          </div>

        </div>

        <!-- Table -->
        <UTable class="hidden md:block" :columns="columns" :data="isLoading ? skeletonRows : state.records" :loading="isLoading">
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
          <!-- Skeleton for each column when loading -->
          <template v-if="isLoading" #studentName-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <!-- Skeleton for each column when loading -->
          <template v-if="isLoading" #present-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <!-- Skeleton for each column when loading -->
          <template v-if="isLoading" #late-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <!-- Skeleton for each column when loading -->
          <template v-if="isLoading" #excused-cell>
            <USkeleton class="h-4 w-32" />
          </template>
          <!-- Skeleton for each column when loading -->
          <template v-if="isLoading" #reason-cell>
            <USkeleton class="h-4 w-32" />
          </template>
        </UTable>
        <div class="md:hidden" v-for="(row, i) in state.records" :key="row.studentId">
          <div class="flex space-x-2 p-2">
            <div>
              <UAvatar alt="Ishmael Kargbo" size="lg" />
            </div>
            <div>
              <p>{{ row.studentName }}</p>
              <p class="text-[11px] text-mute">{{ row.admissionNumber }}</p>
            </div>
          </div>
          <div class="border-y border-gray-100 bg-gray-50 space-x-2 p-3">
            <UCheckbox label="Present" size="xs" color="success" variant="card" :disabled="isDisable"
              :model-value="row.present" @change="stateChange(i, 'present')" />

            <UCheckbox label="Late" size="xs" color="warning" variant="card" :disabled="isDisable"
              :model-value="row.late" @change="stateChange(i, 'late')" />

            <UCheckbox label="Excused" size="xs" color="secondary" variant="card" :disabled="isDisable"
              :model-value="row.excused" @change="stateChange(i, 'excused')" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-end">
          <UButton type="submit" icon="lucide:save" label="Save Attendance" :loading="isLoading" />
        </div>
      </template>
    </UCard>
  </UForm>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent, TableColumn } from '#ui/types'

const skeletonRows = Array(runtimeConf().limit).fill({})
const classStore = useClassSessionStore()
const store = useAttendanceStore()

const router = useRouter()
const route = useRoute()
const { error, success } = useNotify()

const { report } = storeToRefs(store)

const isLoading = ref(false)
const selectedClass = ref<ClassSession>()

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

type AttendanceRowRecord = {
  attendanceId: string
  studentName: string
  studentId: string
  admissionNumber: string
  present: boolean
  late: boolean
  excused: boolean
  reason: string
}

type AttendanceForm = {
  classId: string
  records: AttendanceRowRecord[]
  date: string
  holiday: boolean
}

const state = reactive<AttendanceForm>({
  classId: '',
  date: todayISO(),
  records: [],
  holiday: false
})

const classes = computed(() =>
  classStore.records.map((e: ClassSession) => {
    let label = `${e.clazz} (${e.sectionName}) - ${e.totalStudent}`

    if (e.streamName !== 'N/A') {
      label = `${e.clazz} (${e.sectionName} - ${e.streamName}) - ${e.totalStudent}`
    }

    return {
      label,
      value: e.clazzId
    }
  })
)

function updateQuery() {
  router.replace({
    query: {
      class: state.classId,
      date: state.date
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
  selectedClass.value = classStore.records.find(
    e => e.clazzId === state.classId
  )

  if (!selectedClass.value) return
  isLoading.value = true

  try {
    updateQuery()

    state.records = await store.getSession(
      selectedClass.value.id,
      state.date
    )
    state.holiday = report.value.holiday

    await store.fetchAll(selectedClass.value.id)
  } finally {
    isLoading.value = false
  }
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

    const records: AttendanceRecord[] = state.records.map(r => ({
      studentId: r.studentId,
      present: r.present,
      late: r.late,
      excused: r.excused,
      reason: r.reason
    }))

    await store.create(selectedClass.value.id, {
      date: state.date,
      records,
      holiday: state.holiday
    })

    success('Attendance saved successfully')

    calculateReport(true)
    fetchRecords()

  } catch (err) {
    error('Something went wrong')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await classStore.fetchAll()

  state.classId =
    (route.query.class as string) ||
    classStore.records[0]?.clazzId ||
    ''

  state.date =
    (route.query.date as string) ||
    todayISO()

  if (state.classId) {
    await fetchRecords()
  }

})
</script>