<template>
    <UCard>
        <UForm :schema="schema" :state="state" class="space-y-3" @submit.prevent="onSubmit">
            <!-- Header -->
            <div class="flex items-center">
                <p class="text-lg font-normal flex-1">Mark Attendance</p>

                <div class="flex flex-1 space-x-5">
                    <UFormField name="classId" class="w-full">
                        <USelect @change="fetchRecords" :items="classes" v-model="state.classId"
                            placeholder="Select class" />
                    </UFormField>
                    <UFormField name="date" class="w-full">
                        <UInput @change="fetchRecords" v-model="state.date" type="date" />
                    </UFormField>
                </div>
            </div>

            <div v-if="state.classId">
                <!-- Actions -->
                <div class="flex space-x-3 border-y border-gray-200 py-4 bg-gray-50/40 px-3">
                    <UCheckbox v-if="report.holiday" size="xs" v-model="state.holiday" variant="card" color="info"
                        label="Mark on Holiday" />
                    <div class="flex space-x-3">
                        <UButton :disabled="isDisable" variant="subtle" size="sm" color="success"
                            label="Mark All Present" @click="markAllPresent" />
                        <UButton :disabled="isDisable" variant="subtle" size="sm" color="error" label="Clear All"
                            @click="clearAll" />
                    </div>
                </div>
                <!-- Table -->
                <UTable :columns="columns" :data="state.records" :loading="isLoading">
                    <template #present-cell="{ row }">
                        <UCheckbox :disabled="isDisable" color="success" variant="card" label="Present" size="xs"
                            @change="stateChange(row.index, 'present')" :model-value="row.original.present" />
                    </template>

                    <template #late-cell="{ row }">
                        <UCheckbox :disabled="isDisable" color="warning" variant="card" label="Late" size="xs"
                            @change="stateChange(row.index, 'late')" :model-value="row.original.late" />
                    </template>

                    <template #excused-cell="{ row }">
                        <UCheckbox :disabled="isDisable" color="secondary" label="Excused" size="xs" variant="card"
                            @change="stateChange(row.index, 'excused')" :model-value="row.original.excused" />
                    </template>

                    <template #reason-cell="{ row }">
                        <UFormField :name="`records.${row.index}.reason`">
                            <UInput v-model="row.original.reason" :disabled="!row.original.excused"
                                :placeholder="row.original.excused ? 'Enter excuse reason...' : ''" />
                        </UFormField>
                    </template>
                </UTable>

                <!-- Submit -->
                <div class="pt-3 border-t border-gray-200 flex justify-end">
                    <UButton type="submit" icon="mynaui:save" label="Save Attendance" :loading="isLoading" />
                </div>
            </div>
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent, TableColumn } from '#ui/types'

const classStore = useClassSessionStore()
const store = useAttendanceStore()
const router = useRouter()
const toast = useToast()
const route = useRoute()
const { report } = storeToRefs(store)

const isLoading = ref(false)

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

const clazz = computed<string>({
    get: () => route.query.class as string,
    set: (val) => updateQuery({ page: val })
})

const date = computed<string>({
    get: () => route.query.date as string,
    set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
    const merged = { ...route.query, ...newQuery }

    if (
        merged.date === route.query.date &&
        merged.class === route.query.class
    ) {
        return
    }

    router.replace({ query: merged })
}

const state = reactive<AttendanceForm>({
    classId: '',
    date: todayISO() || '',
    records: [],
    holiday: false
})

async function fetchRecords() {
    selectedClass.value = classStore.records.find(e => e.clazzId == state.classId)

    state.records = []
    state.holiday = false
    isLoading.value = true
    if (selectedClass.value == null) return

    router.replace({
        query: {
            date: state.date,
            class: state.classId
        }
    })

    const res: any = await store.getSession(selectedClass.value.id, state.date)
    state.records = res

    isLoading.value = false

    await store.fetchAll(selectedClass.value.id)
}

const columns: TableColumn<AttendanceRowRecord>[] = [
    { accessorKey: 'studentName', header: 'Student' },
    { accessorKey: 'present', header: 'Present' },
    { accessorKey: 'late', header: 'Late' },
    { accessorKey: 'excused', header: 'Excused' },
    { accessorKey: 'reason', header: 'Reason' }
]

function calculateReport(checkAbsent: boolean = false) {
    let present = 0
    let late = 0
    let excused = 0
    let marked = state.records.length
    let absent = 0

    state.records.map(e => {
        if (e.present) {
            present = present + 1
        } else if (e.late) {
            late = late + 1
        } else if (e.excused) {
            excused = excused + 1
        } else if (checkAbsent) {
            absent = absent + 1
        }
    })

    store.updateReport({ absent, excused, late, marked, present, rate: 0, holiday: false })
}
const isDisable = computed(() => report.value.holiday && !state.holiday)

function stateChange(index: number, type: 'present' | 'late' | 'excused') {
    const record = state.records[index]
    if (!record) return

    if (record[type]) {
        record.present = false
        record.late = false
        record.excused = false
        record.reason = ''
        return
    }

    record.present = type === 'present'
    record.late = type === 'late'
    record.excused = type === 'excused'


    if (type !== 'excused') {
        record.reason = ''
    }

    calculateReport()
}

function markAllPresent() {
    state.records.forEach(r => {
        r.present = true
        r.late = false
        r.excused = false
        r.reason = ''
    })
}

function clearAll() {
    state.records.forEach(r => {
        r.present = false
        r.late = false
        r.excused = false
        r.reason = ''
    })
}

const selectedClass = ref<ClassSession>()
const classes = computed(() => classStore.records.map((e: ClassSession) => {
    let label = `${e.clazz} (${e.sectionName}) - ${e.totalStudent}`

    if (e.streamName != "N/A") {
        label = `${e.clazz} (${e.sectionName} - ${e.streamName}) - ${e.totalStudent}`
    }
    return { label, value: e.clazzId }
}))

const schema = yup.object({
    classId: yup.string().required('Class is required'),
    date: yup.string().required('Date is required'),

    records: yup.array().of(
        yup.object({
            present: yup.boolean().required(),
            late: yup.boolean().required(),
            excused: yup.boolean().required(),

            reason: yup.string().when('excused', {
                is: true,
                then: schema =>
                    schema
                        .required('Reason is required when student is excused')
                        .min(3, 'Reason must be at least 3 characters'),
                otherwise: schema => schema.notRequired()
            })
        })
    )
})

const onSubmit = async (event: FormSubmitEvent<AttendanceForm>) => {
    if (selectedClass.value == null) return

    isLoading.value = true
    try {
        const records: AttendanceRecord[] = state.records.map(e => ({
            studentId: e.studentId,
            excused: e.excused,
            late: e.late,
            present: e.present,
            reason: e.reason
        }))

        await store.create(selectedClass.value.id, {
            date: state.date,
            records: records,
            holiday: state.holiday
        })
        toast.add({
            description: 'Attendance saved successfully',
            color: 'success'
        })
        calculateReport(true)
    } catch (err: any) {
        toast.add({
            description: err?.message || 'Something went wrong',
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    await classStore.fetchAll(0, 0)
    state.records = []

    if (date.value) {
        state.date = date.value
    }

    if (clazz.value) {
        state.classId = clazz.value
        fetchRecords()
    }
})

watch(() => [date.value, clazz.value], () => {
    if (date.value && clazz.value) {
        state.date = date.value
        state.classId = clazz.value
    }
    fetchRecords()
}, { immediate: true })
</script>