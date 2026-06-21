<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Athletic House Management" subtitle="Manage and assignment student to houses">
            <div class="w-1/3">
                <USelectMenu :items="classes" value-key="value" v-model="selectedClass" placeholder="Select Class" />
            </div>
        </Heading>
        <div class="flex space-x-4">
            <div class="w-1/3 space-y-4">
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-3">

                            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <UIcon name="i-lucide-info" class="text-primary" />
                            </div>

                            <div>
                                <h3 class="font-semibold">
                                    House Masters
                                </h3>

                                <p class="text-xs text-muted">
                                    Scheme details and progress
                                </p>
                            </div>
                        </div>
                    </template>
                    <div>
                        <div v-for="item in houseStore.records" :key="`${item.id}-masters`" class="border-b py-3 last:pb-0 first:pt-0 border-gray-300 last:border-b-0">
                            <div class="flex space-x-4 items-center">
                                <div>
                                    <div class="size-5 rounded border shadow-sm" :style="{ backgroundColor: item.color }" />
                                </div>
                                <div>
                                    <UBadge v-for="m in item.houseMasters" :key="m.id" color="neutral"
                                        variant="soft">
                                        {{ m.user?.givenNames }} {{ m.user?.familyName }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <UIcon name="i-lucide-bar-chart-3" class="text-primary" />
                            </div>

                            <div>
                                <h3 class="font-semibold">House Placement</h3>
                                <p class="text-xs text-muted">Students per house</p>
                            </div>
                        </div>
                    </template>

                    <div class="space-y-2">
                        <div v-for="h in houseStore.records" :key="h.id"
                            class="flex justify-between items-center text-sm">
                            <span>{{ h.name }}</span>
                            <UBadge color="primary">{{ 0 }}</UBadge>
                        </div>
                    </div>
                </UCard>
            </div>
            <div class="w-2/3">
                <UCard :ui="{
                    body: 'sm:p-0'
                }">
                    <UTable :columns="columns" :data="students">
                        <template #givenNames-cell="{ row }">
                            <div class="flex space-x-4">
                                <div>
                                    <UAvatar :src="row.original.photo" />
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
                </UCard>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const store = useHouseStore()
const classStore = useClassStore()
const houseStore = useHouseStore()
const studentStore = useStudentStore()

const selectedClass = ref<string | undefined>()

const classes = computed(() => classStore.records.map((e) => ({ label: e.name, value: e.id })))
const houses = computed(() => houseStore.records.map((e) => ({ label: e.name, value: e.id })))

const houseStats = ref([])
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
