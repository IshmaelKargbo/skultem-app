<template>
    <div class="space-y-3 px-4 md:px-6">
        <Heading title="Fee History" subtitle="History of fee payments and transactions">
            <div class="md:w-72 w-full">
                <USelectMenu data-guide="par-child" v-model="state.student" value-key="value" :loading="loading" :items="children"
                    placeholder="Select Student" />
            </div>
        </Heading>
        <GuideBar topic="parent-fees" />
        <div data-guide="par-fee-summary"><FeeParentReport :student="state.student" /></div>
        <TabMobile class="md:hidden block" :tabs="tabs">
            <template #overview-data>
                <FeeParentOverviewMobile :student="state.student" />
            </template>
            <template #history-data>
                <FeeParentHistoryMobile :student="state.student" />
            </template>
        </TabMobile>
        <div data-guide="par-fee-overview"><FeeParentOverview class="hidden md:block" :student="state.student" /></div>
        <div data-guide="par-fee-history"><FeeParentHistory class="hidden md:block" :student="state.student" /></div>
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