<template>
    <UCard variant="subtle">
        <p class="text-base">Data Source</p>
        <p class="text-xs text-mute">Select the data entity you want to explore</p>

        <div class="mt-3 grid grid-cols-6 gap-3">
            <UButton
                v-for="(item, index) in datasource"
                :key="item.key"
                :label="item.value"
                size="xl"
                class="w-full flex justify-center"
                :color="active === index ? 'primary' : 'neutral'"
                :variant="active === index ? 'solid' : 'outline'"
                @click="onSelect(index)"
            />
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
    { name: "Not Equals (!=)", operator: "neq", type: "text", input: "text" },
    { name: "Contains", operator: "contains", type: "text", input: "text" },
    { name: "Starts With (^)", operator: "starts_with", type: "text", input: "text" },
    { name: "Ends With ($)", operator: "ends_with", type: "text", input: "text" },
]

const numberOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "number", input: "number" },
    { name: "Not Equals (!=)", operator: "neq", type: "number", input: "number" },
    { name: "Greater Than (>)", operator: "gt", type: "number", input: "number" },
    { name: "Greater Than Or Equal (>=)", operator: "gte", type: "number", input: "number" },
    { name: "Less Than (<)", operator: "lt", type: "number", input: "number" },
    { name: "Less Than Or Equal (<=)", operator: "lte", type: "number", input: "number" },
    { name: "Between (↔)", operator: "between", type: "range", input: "range" },
]

const dateOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "date", input: "date" },
    { name: "Not Equals (!=)", operator: "neq", type: "date", input: "date" },
    { name: "After (>)", operator: "gt", type: "date", input: "date" },
    { name: "Before (<)", operator: "lt", type: "date", input: "date" },
    { name: "Between (↔)", operator: "between", type: "range", input: "date-range" },
]

const selectOperators = (options: Option[] = []): ReportOperator[] => [
    { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
    { name: "Not Equals (!=)", operator: "neq", type: "select", input: "select", options },
    { name: "In List (∈)", operator: "in", type: "multi-select", input: "multi-select", options },
]

const sessionStore = useClassSessionStore()

const sessions = computed(() =>
    sessionStore.records.map((e) => ({
        label: parseClassSession(e),
        value: e.id
    }))
)

const emit = defineEmits<{
    select: [payload: ReportSelectPayload]
}>()

const active = ref(0)

const filtersMap: Record<string, () => ReportFilter[]> = {

    Students: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "gender", label: "Gender", operators: selectOperators(genderOption) },
        { field: "class", label: "Class", operators: selectOperators(sessions.value) },
        { field: "age", label: "Age", operators: numberOperators },
        { field: "admission_date", label: "Admission Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Teachers: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "gender", label: "Gender", operators: selectOperators(genderOption) },
        { field: "subject", label: "Subject", operators: selectOperators() },
        { field: "hire_date", label: "Hire Date", operators: dateOperators },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Classes: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "level", label: "Level", operators: selectOperators() },
        { field: "status", label: "Status", operators: selectOperators() },
    ],

    Subjects: () => [
        { field: "name", label: "Name", operators: textOperators },
        { field: "code", label: "Code", operators: textOperators },
        { field: "status", label: "Status", operators: selectOperators() },
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
        name: selected.value,
        filters: filters
    })
}

onMounted(() => {
    sessionStore.fetchAll(0, 0)

    const selected = datasource[active.value]
    if (selected) {
        onSelect(active.value)
    }
})
</script>