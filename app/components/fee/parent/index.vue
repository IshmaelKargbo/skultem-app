<template>
    <div class="md:space-y-5 space-y-3 h-full overflow-y-auto p-4 md:p-7">
        <Heading title="Fee History" subtitle="History of fee payments and transactions">
            <div class="md:w-72 w-full">
                <USelectMenu v-model="state.student" value-key="value" :loading="loading" :items="children"
                    placeholder="Select Student" />
            </div>
        </Heading>
        <FeeParentReport :student="state.student" />
        <TabMobile class="md:hidden block" :tabs="tabs">
            <template #overview-data>
                <FeeParentOverviewMobile :student="state.student" />
            </template>
            <template #history-data>
                <FeeParentHistoryMobile :student="state.student" />
            </template>
        </TabMobile>
        <FeeParentOverview :student="state.student" />
        <FeeParentHistory :student="state.student" />
    </div>
</template>

<script lang="ts" setup>
const store = useParentStore()
const state = reactive({
    student: ''
})

const tabs = [
    {
        label: 'Overview',
        key: 'overview'
    },
    {
        key: 'history',
        label: 'History'
    }
]

const { students } = storeToRefs(store)
const loading = ref(true)

const children = computed(() =>
    students.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.className}`,
        value: e.id
    }))
)

watch(() => children.value, () => {
    state.student = children.value[0]?.value || ''
})

onMounted(async () => {
    useAppStore().setTitle('Fees')
    await store.fetchAllStudents(0, 0)
    loading.value = false
    document.title = 'Fees | Skultem'
})

definePageMeta({
    role: [Role.PARENT]
})
</script>