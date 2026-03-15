<template>
    <UCard variant="subtle">
        <p class="text-base">Data Source</p>
        <p class="text-xs text-mute">Select the data entity you want to explore</p>

        <div class="mt-3 grid grid-cols-6 gap-3">
            <UButton v-for="(item, index) in datasource" :key="item.key" :label="item.value" size="lg"
                class="w-full flex justify-center" :color="active === index ? 'primary' : 'neutral'"
                :variant="active === index ? 'solid' : 'outline'" @click="onSelect(index)" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
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
    { key: "attendance", value: "Attendance" },
    { key: "exams", value: "Exams" },
    { key: "results", value: "Results" },
    { key: "parents", value: "Parents" },
    { key: "fees", value: "Fees" },
    { key: "payments", value: "Payments" },
    { key: "announcements", value: "Announcements" },
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
    { name: "Between (↔)", operator: "BETWEEN", type: "range", input: "date-range" },
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

const equalOperators = (options: Option[] = []): ReportOperator[] => [
    { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const sessionStore = useClassSessionStore()
const sectionStore = useSectionStore()
const streamStore = useStreamStore()
const teacherStore = useTeacherStore()

const sessions = computed(() =>
    sessionStore.records.map((e) => ({
        label: parseClassSession(e),
        value: e.clazzId
    }))
)

const sections = computed(() =>
    sectionStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const teachers = computed(() =>
    teacherStore.records.map((e) => ({
        label: `${e.user.givenNames} ${e.user.familyName} (${e.staffId})`,
        value: e.id
    }))
)

const streams = computed(() =>
    streamStore.records.map((e) => ({
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

const filtersMap: Record<string, () => ReportFilter[]> = {
    Students: () => [
        { field: "student.givenNames", label: "Given Names", operators: textOperators },
        { field: "student.familyName", label: "Family Name", operators: textOperators },
        { field: "student.dateOfBirth", label: "Age", operators: ageOperators },
        { field: "student.gender", label: "Gender", operators: selectOperators(genderOption) },
        { field: "clazz.id", label: "Class", operators: equalOperators(sessions.value) },
        { field: "createdAt", label: "Admission Date", operators: instantOperators },
        { field: "student.status", label: "Status", operators: selectOperators(studentStatus) },
    ],

    Teachers: () => [
        { field: "user.givenNames", label: "Given Names", operators: textOperators },
        { field: "user.familyName", label: "Family Name", operators: textOperators },
        { field: "gender", label: "Gender", operators: selectOperators(genderOption) },
        { field: "hireDate", label: "Hire Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Classes: () => [
        { field: "clazz.name", label: "Name", operators: textOperators },
        { field: "clazz.level", label: "Level", operators: selectOperators(levels) },
        { field: "clazz.status", label: "Status", operators: equalOperators(status) },
    ],

    Subjects: () => [
        { field: "subject.name", label: "Name", operators: textOperators },
        { field: "session.clazz.id", label: "Class", operators: equalOperators(sessions.value) },
        { field: "session.section.id", label: "Section", operators: equalOperators(sections.value) },
        { field: "session.stream.id", label: "Stream", operators: equalOperators(streams.value) },
        { field: "teacher.id", label: "Teacher", operators: equalOperators(teachers.value) },
    ],

    Attendance: () => [
        { field: "student", label: "Student", operators: textOperators },
        { field: "class", label: "Class", operators: selectOperators(sessions.value) },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Exams: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "class", label: "Class", operators: selectOperators(sessions.value) },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Results: () => [
        { field: "student", label: "Student", operators: textOperators },
        { field: "subject", label: "Subject", operators: selectOperators() },
        { field: "score", label: "Score", operators: numberOperators },
        { field: "grade", label: "Grade", operators: selectOperators() },
        { field: "term", label: "Term", operators: selectOperators() },
    ],

    Parents: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "gender", label: "Gender", operators: selectOperators(genderOption) },
        { field: "student", label: "Student", operators: textOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Fees: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "amount", label: "Amount", operators: numberOperators },
        { field: "due_date", label: "Due Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Payments: () => [
        { field: "student", label: "Student", operators: textOperators },
        { field: "amount", label: "Amount", operators: numberOperators },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "method", label: "Method", operators: selectOperators() },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Announcements: () => [
        { field: "title", label: "Title", operators: textOperators },
        { field: "date", label: "Date", operators: dateOperators },
        { field: "audience", label: "Audience", operators: selectOperators() },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

}

function onSelect(index: number) {

    active.value = index

    const selected = datasource[index]
    if (!selected) return

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

    const selected = datasource[active.value]
    if (selected) {
        onSelect(active.value)
    }
})
</script>