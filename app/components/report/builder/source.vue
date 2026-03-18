<template>
    <UCard variant="subtle">
        <p class="text-base">Data Source</p>
        <p class="text-xs text-mute">Select the data entity you want to explore</p>

        <div class="mt-3 grid grid-cols-4 gap-3">
            <UButton v-for="(item, index) in datasource" :key="item.key" :label="item.value" size="lg"
                class="w-full flex justify-center" :color="active === index ? 'primary' : 'neutral'"
                :variant="active === index ? 'solid' : 'outline'" @click="onSelect(index)"
                :disabled="isDisable(item.key)" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { report } = storeToRefs(useReportStore())

type Option = {
    label: string
    value: string | number
}

type ReportOperator = {
    name: string
    operator: string
    type: string
    input: string
    options?: Option[]
}

type ReportFilter = {
    field: string
    label: string
    operators: ReportOperator[]
    default?: number
}

type Datasource = {
    key: string
    value: keyof typeof filtersMap
}

const datasource: Datasource[] = [
    { key: "students", value: "Students" },
    { key: "teachers", value: "Teachers" },
    { key: "classes", value: "Classes" },
    { key: "subjects", value: "Subjects" },
    { key: "attendances", value: "Attendances" },
    { key: "grades", value: "Grades" },
    { key: "fees", value: "Fees" },
    { key: "payments", value: "Payments" }
]

const textOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "text", input: "text" },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "text", input: "text" },
    { name: "Contains", operator: "CONTAINS", type: "text", input: "text" },
    { name: "Starts With (^)", operator: "STARTS_WITH", type: "text", input: "text" },
    { name: "Ends With ($)", operator: "ENDS_WITH", type: "text", input: "text" },
]

const numberOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "number", input: "number" },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "number", input: "number" },
    { name: "Greater Than (>)", operator: "GREATER_THAN", type: "number", input: "number" },
    { name: "Greater Than Or Equal (>=)", operator: "GREATER_THAN_OR_EQUAL", type: "number", input: "number" },
    { name: "Less Than (<)", operator: "LESS_THAN", type: "number", input: "number" },
    { name: "Less Than Or Equal (<=)", operator: "LESS_THAN_OR_EQUAL", type: "number", input: "number" },
    { name: "Between (↔)", operator: "BETWEEN", type: "range", input: "range" },
]

const ageOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "age", input: "number" },
    { name: "Greater Than (>)", operator: "GREATER_THAN", type: "age", input: "number" },
    { name: "Less Than (<)", operator: "LESS_THAN", type: "age", input: "number" },
    { name: "Between (↔)", operator: "BETWEEN", type: "age", input: "range" },
]

const dateOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "date", input: "date" },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "date", input: "date" },
    { name: "After (>)", operator: "GREATER_THAN", type: "date", input: "date" },
    { name: "Before (<)", operator: "LESS_THAN", type: "date", input: "date" },
    { name: "Between (↔)", operator: "BETWEEN", type: "date", input: "date-range" },
]

const instantOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "instant", input: "date" },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "instant", input: "date" },
    { name: "After (>)", operator: "GREATER_THAN", type: "instant", input: "date" },
    { name: "Before (<)", operator: "LESS_THAN", type: "instant", input: "date" },
    { name: "Between (↔)", operator: "BETWEEN", type: "instant", input: "date-range" },
]

const selectOperators = (options: Option[] = []): ReportOperator[] => [
    { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options },
    { name: "In List (∈)", operator: "IN_LIST", type: "multi-select", input: "multi-select", options },
]

const equalSelectOperators = (options: Option[] = []): ReportOperator[] => [
    { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const sessionStore = useClassSessionStore()
const sectionStore = useSectionStore()
const streamStore = useStreamStore()
const studentStore = useStudentStore()
const teacherStore = useTeacherStore()
const termStore = useTermStore()
const feeStore = useFeeStore()
const assessmentStore = useAssessmentStore()
const subjectStore = useSubjectStore()

const sessions = computed(() =>
    sessionStore.records.map((e) => ({
        label: parseClassSession(e),
        value: e.clazzId
    }))
)

const allocationType = computed(() => [
    { label: "All Classes", value: "null" },
    ...sessionStore.records.map((e) => ({
        label: parseClassSession(e),
        value: e.clazzId
    }))
])

const sections = computed(() =>
    sectionStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

function isDisable(entity: string) {
    if (report.value && route.query.id) {
        return entity != report.value.entity
    }

    return false
}

const students = computed(() =>
    studentStore.records.map((e) => ({
        label: `${e.givenNames} ${e.familyName} (${e.admissionNumber})`,
        value: e.id
    }))
)

const teachers = computed(() =>
    teacherStore.records.map((e) => ({
        label: `${e.user.givenNames} ${e.user.familyName} (${e.staffId})`,
        value: e.id
    }))
)

const assessments = computed(() =>
    assessmentStore.assessments.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const terms = computed(() =>
    termStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const subjects = computed(() =>
    subjectStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const streams = computed(() =>
    streamStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const fees = computed(() =>
    feeStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const emit = defineEmits<{
    select: [payload: ReportSelectPayload]
}>()

const active = ref(0)

const studentStatus = [
    {
        label: "Active", value: "ACTIVE"
    },
    {
        label: "Graduated", value: "GRADUATED"
    },
    {
        label: "Transferred", value: "TRANSFERRED"
    },
    {
        label: "Suspended", value: "SUSPENDED"
    },
    {
        label: "Deleted", value: "DELETED"
    }
]

const status = [
    {
        label: "Active", value: "ACTIVE"
    },
    {
        label: "Inactive", value: "INACTIVE"
    },
    {
        label: "Deleted", value: "DELETED"
    }
]

const feeStatus = [
    {
        label: "Pending", value: "PENDING"
    },
    {
        label: "Overdue", value: "OVERDUE"
    },
    {
        label: "Paid", value: "PAID"
    }
]

const assessmentStatus = [
    {
        label: "Draft", value: "DRAFT"
    },
    {
        label: "Submited", value: "SUBMITED"
    },
    {
        label: "Returned", value: "RETURNED"
    },

    {
        label: "Approved", value: "APPROVED"
    },
    {
        label: "Locked", value: "LOCKED"
    }
]

const attendanceState = [
    {
        label: "Present", value: "Present"
    },
    {
        label: "Absent", value: "Absent"
    },
    {
        label: "Late", value: "Late"
    },
    {
        label: "Excused", value: "Excused"
    }
]

const paymentMethods = [
    {
        label: "Cash", value: "CASH"
    },
    {
        label: "Bank Transfer", value: "BANK"
    },
    {
        label: "Mobile Money", value: "MOBILE_MONEY"
    }
]

const filtersMap: Record<string, () => ReportFilter[]> = {
    Students: () => [
        { field: "student.givenNames", label: "Given Names", operators: textOperators },
        { field: "student.familyName", label: "Family Name", operators: textOperators },
        { field: "student.dateOfBirth", label: "Age", operators: ageOperators },
        { field: "student.gender", label: "Gender", operators: equalSelectOperators(genderOption) },
        { field: "clazz.id", label: "Class", operators: equalSelectOperators(sessions.value) },
        { field: "createdAt", label: "Admission Date", operators: instantOperators },
        { field: "student.status", label: "Status", operators: equalSelectOperators(studentStatus) },
    ],

    Teachers: () => [
        { field: "user.givenNames", label: "Given Names", operators: textOperators },
        { field: "user.familyName", label: "Family Name", operators: textOperators },
        { field: "gender", label: "Gender", operators: equalSelectOperators(genderOption) },
        { field: "hireDate", label: "Hire Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Classes: () => [
        { field: "clazz.name", label: "Name", operators: textOperators },
        { field: "clazz.level", label: "Level", operators: equalSelectOperators(levels) },
        { field: "clazz.status", label: "Status", operators: equalSelectOperators(status) },
    ],

    Subjects: () => [
        { field: "subject.name", label: "Name", operators: textOperators },
        { field: "session.clazz.id", label: "Class", operators: equalSelectOperators(sessions.value) },
        { field: "session.section.id", label: "Section", operators: equalSelectOperators(sections.value) },
        { field: "session.stream.id", label: "Stream", operators: equalSelectOperators(streams.value) },
        { field: "teacher.id", label: "Teacher", operators: equalSelectOperators(teachers.value) },
    ],

    Attendances: () => [
        { field: "enrollment.student.id", label: "Student", operators: equalSelectOperators(students.value) },
        { field: "enrollment.clazz.id", label: "Class", operators: equalSelectOperators(sessions.value) },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "status", label: "Status", operators: equalSelectOperators(attendanceState) },
    ],

    Grades: () => [
        { field: "studentAssessment.enrollment.clazz.id", label: "Class", operators: selectOperators(sessions.value), default: 0 },
        { field: "cycle.term.id", label: "Term", operators: equalSelectOperators(terms.value) },
        { field: "cycle.assessment.id", label: "Assessment", operators: equalSelectOperators(assessments.value) },
        { field: "studentAssessment.enrollment.student.id", label: "Student", operators: equalSelectOperators(students.value) },
        { field: "cycle.subject.subject.id", label: "Subject", operators: equalSelectOperators(subjects.value) },
        { field: "cycle.status", label: "Status", operators: equalSelectOperators(assessmentStatus) },
    ],

    Fees: () => [
        { field: "fee.term.id", label: "Term", operators: equalSelectOperators(terms.value) },
        { field: "fee.category.id", label: "Fee", operators: equalSelectOperators(fees.value) },
        { field: "fee.clazz.id", label: "Class", operators: equalSelectOperators(allocationType.value) },
        { field: "student.id", label: "Student", operators: equalSelectOperators(students.value) },
        { field: "status", label: "Status", operators: equalSelectOperators(feeStatus) },
    ],

    Payments: () => [
        { field: "fee.category.id", label: "Fee", operators: equalSelectOperators(fees.value) },
        { field: "method", label: "Method", operators: selectOperators(paymentMethods) },
        { field: "amount", label: "Amount", operators: numberOperators },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "student.id", label: "Student", operators: equalSelectOperators(students.value) }
    ],
}

function onSelect(index: number) {
    active.value = index

    const selected = datasource[index]
    if (!selected) return

    router.replace({
        query: {
            ...route.query,
            entity: selected.key
        }
    })

    const filters = filtersMap[selected.value]?.() ?? []

    emit("select", {
        entity: selected.value,
        filters: filters
    })
}

onMounted(async () => {
    await sessionStore.fetchAll(0, 0)
    await sectionStore.fetchAll(0, 0)
    await teacherStore.fetchAll(0, 0)
    await studentStore.fetchAll(0, 0)
    await termStore.fetchAll(0, 0)
    await subjectStore.fetchAll(0, 0)
    await assessmentStore.fetchAssessments()
    await feeStore.fetchAll(0, 0)

    const selected = datasource[active.value]
    if (selected) {
        onSelect(active.value)
    }
})

watch(() => route.query.entity, () => {
    const entity = route.query.entity as string
    if (entity == null) return
    const index = datasource.findIndex(e => (e.key == entity))
    if (index < 0) return
    onSelect(index)
}, { immediate: true })
</script>