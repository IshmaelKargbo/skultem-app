<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Athletic House Management" subtitle="Manage and assignment student to houses">
            <div>
                <USelectMenu class="w-56" :items="classes" value-key="value" v-model="selectedClass"
                    placeholder="Select Class" />
            </div>
        </Heading>
        <UCard :ui="{
            body: 'sm:p-0'
        }">
            <UTable :columns="columns" :data="students">
                <template #givenNames-cell="{ row }">
                    <div class="flex space-x-4">
                        <div>
                            <UAvatar :src="row.original.photo"
                                :alt="`${row.original.givenNames} ${row.original.familyName}`" />
                        </div>
                        <div>
                            <p class="space-x-2"><span>{{ row.original.givenNames }}</span><span>{{
                                row.original.familyName
                                    }}</span></p>
                            <p class="text-xs text-muted">{{ row.original.admissionNumber }}</p>
                        </div>
                    </div>
                </template>

                <template #house-cell="{ row }">
                    <USelectMenu :items="houses" placeholder="Assign house" />
                </template>
            </UTable>
            <template #footer>
                <div class="flex space-x-2">
                    <UButton variant="outline" color="error" label="Cancel" />
                    <UButton label="Save Changes" :trailing-icon="SAVE_ICON" />
                </div>
            </template>
        </UCard>
    </div>
</template>
<script setup lang="ts">
const classStore = useClassStore()
const houseStore = useHouseStore()
const studentStore = useStudentStore()

const selectedClass = ref<string | undefined>()

const classes = computed(() => classStore.records.map((e) => ({ label: e.name, value: e.id })))
const houses = computed(() => houseStore.records.map((e) => ({ label: e.name, value: e.id })))

const students = ref<Student[]>([])
const loading = ref(false)

const columns = [
    {
        accessorKey: 'givenNames',
        header: 'Student'
    },
    {
        id: 'house',
        header: 'House'
    }
]

onMounted(async () => {
    useAppStore().setTitle('Athletic Management')
    document.title = 'Athletic House Management | Skultem'
    await classStore.fetchAll(0, 0)
    await houseStore.fetchAll(0, 0)
})

// Load students when class changes
watch(selectedClass, async (classId) => {
    if (!classId) return
    loading.value = true
    const { records } = await studentStore.getAllEnrollmentByClass(classId) as any
    students.value = records
    loading.value = false
})

// Assign student to house
const assignHouse = async (studentId: string, houseId: string) => {
    //   await store.assignStudentToHouse(studentId, houseId)

    // refresh stats after assignment
    if (selectedClass.value) {
        // await store.fetchHouseStats(selectedClass.value)
    }
}

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
