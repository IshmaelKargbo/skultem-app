<template>
    <div class="md:px-6 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Athletic House Management" subtitle="Assign students to houses — arrange automatically or by hand">
            <div class="w-56">
                <USelectMenu :items="classes" value-key="value" v-model="selectedClass" placeholder="Select Class"
                    :loading="classStore.loading" class="w-full" />
            </div>
        </Heading>

        <div class="flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/3 space-y-4">
                <!-- House Placement -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <UIcon name="i-lucide-bar-chart-3" class="text-primary" />
                            </div>

                            <div>
                                <h3 class="font-semibold">House Placement</h3>
                                <p class="text-xs text-muted">
                                    {{ selectedClass ? `Students per house in ${className}` : 'Select a class to see the breakdown' }}
                                </p>
                            </div>
                        </div>
                    </template>

                    <div v-if="selectedClass && houseStore.records.length" class="space-y-4">
                        <div v-for="h in placement" :key="h.id" class="space-y-1.5">
                            <div class="flex justify-between items-center text-sm">
                                <div class="flex items-center gap-2 min-w-0">
                                    <div class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: h.color }" />
                                    <span class="truncate">{{ h.name }}</span>
                                </div>
                                <UBadge color="neutral" variant="soft">{{ h.count }}</UBadge>
                            </div>
                            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                                <div class="h-full rounded-full transition-all duration-300"
                                    :style="{ width: `${h.percent}%`, backgroundColor: h.color }" />
                            </div>
                        </div>

                        <div v-if="unassignedCount" class="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-800">
                            <span class="text-muted">Unassigned</span>
                            <UBadge color="warning" variant="soft">{{ unassignedCount }}</UBadge>
                        </div>
                    </div>

                    <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
                        <UIcon name="i-lucide-pie-chart" class="text-3xl text-gray-400" />
                        <p class="text-sm text-muted">
                            {{ houseStore.records.length ? 'Select a class to view its house placement.' : 'Create houses to start tracking placement.' }}
                        </p>
                    </div>
                </UCard>
            </div>

            <div class="w-full md:w-2/3">
                <UCard :ui="{ body: 'sm:p-0' }">
                    <template #header>
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 class="font-semibold">Student Assignments</h3>
                                <p class="text-xs text-muted">
                                    {{ selectedClass ? `${assignedCount} of ${students.length} students assigned` : 'Select a class to begin' }}
                                </p>
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                <UBadge v-if="dirtyCount" color="warning" variant="soft" icon="i-lucide-circle-dot">
                                    {{ dirtyCount }} unsaved
                                </UBadge>

                                <UButton
                                    label="Randomly Arrange"
                                    icon="i-lucide-shuffle"
                                    color="neutral"
                                    variant="outline"
                                    :disabled="!canRandomize"
                                    @click="confirmRandomOpen = true"
                                />

                                <UButton
                                    label="Reset"
                                    color="neutral"
                                    variant="ghost"
                                    v-if="dirtyCount"
                                    :disabled="saving"
                                    @click="resetAssignments"
                                />

                                <UButton
                                    label="Save Changes"
                                    icon="i-lucide-save"
                                    :loading="saving"
                                    :disabled="!dirtyCount"
                                    @click="saveAssignments"
                                />
                            </div>
                        </div>
                    </template>

                    <!-- No class selected -->
                    <div v-if="!selectedClass" class="flex flex-col items-center gap-3 py-16">
                        <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="i-lucide-school" class="text-2xl text-gray-400" />
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">No class selected</p>
                            <p class="text-sm text-gray-500">Choose a class above to view and assign its students.</p>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div v-else-if="loading" class="space-y-3 p-4">
                        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
                    </div>

                    <!-- Empty -->
                    <div v-else-if="!students.length" class="flex flex-col items-center gap-3 py-16">
                        <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="i-lucide-users" class="text-2xl text-gray-400" />
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">No students found</p>
                            <p class="text-sm text-gray-500">This class has no enrolled students yet.</p>
                        </div>
                    </div>

                    <!-- Table -->
                    <UTable v-else :columns="columns" :data="students" :ui="{ td: 'align-middle' }">
                        <template #givenNames-cell="{ row }">
                            <div class="flex space-x-4 items-center">
                                <div>
                                    <UAvatar size="xl" :src="row.original.photo || '/avatar-placeholder.svg'"
                                        :alt="`${row.original.givenNames} ${row.original.familyName}`" />
                                </div>
                                <div class="min-w-0">
                                    <p class="space-x-2 truncate">
                                        <span>{{ row.original.givenNames }}</span><span>{{ row.original.familyName }}</span>
                                    </p>
                                    <p class="text-xs-base text-muted">{{ row.original.admissionNumber }}</p>
                                </div>
                            </div>
                        </template>

                        <template #house-cell="{ row }">
                            <div class="flex items-center gap-2">
                                <USelectMenu
                                    :model-value="assignments[row.original.id]"
                                    @update:model-value="(v: any) => setHouse(row.original.id, v)"
                                    :items="houses"
                                    value-key="value"
                                    placeholder="Assign house"
                                >
                                    <template #leading>
                                        <div v-if="assignments[row.original.id]" class="size-2.5 rounded-full"
                                            :style="{ backgroundColor: houseColor(assignments[row.original.id]) }" />
                                    </template>
                                </USelectMenu>

                                <UIcon v-if="isDirty(row.original.id)" name="i-lucide-circle-dot"
                                    class="text-warning text-xs" />
                            </div>
                        </template>
                    </UTable>
                </UCard>
            </div>
        </div>
        <UModal v-model:open="confirmRandomOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">Randomly Arrange Houses</h3>
                    </template>

                    <div class="space-y-3 text-sm">
                        <p class="text-muted">
                            This will evenly and randomly spread every student in
                            <strong class="text-highlighted">{{ className }}</strong> across
                            <strong class="text-highlighted">{{ houseStore.records.length }}</strong> house{{ houseStore.records.length === 1 ? '' : 's' }}.
                        </p>
                        <UAlert
                            color="warning"
                            variant="soft"
                            icon="i-lucide-alert-triangle"
                            title="This saves immediately"
                            description="Any existing house assignment for students in this class will be overwritten."
                        />
                    </div>

                    <template #footer>
                        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <UButton label="Cancel" variant="soft" color="neutral" :disabled="randomizing" @click="confirmRandomOpen = false" />
                            <UButton label="Randomly Arrange" icon="i-lucide-shuffle" :loading="randomizing" @click="randomizeHouses" />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
<script setup lang="ts">
const classStore = useClassStore()
const houseStore = useHouseStore()
const studentStore = useStudentStore()
const { success, error } = useNotify()

const selectedClass = ref<string | undefined>()
const students = ref<Student[]>([])
const loading = ref(false)
const saving = ref(false)
const randomizing = ref(false)
const confirmRandomOpen = ref(false)

// studentId -> houseId, seeded from each student's current house and
// mutated locally as the user picks from the dropdowns.
const assignments = ref<Record<string, string | undefined>>({})
// snapshot taken right after loading, used to work out what changed.
const original = ref<Record<string, string | undefined>>({})

const classes = computed(() => classStore.records.map((e) => ({ label: e.name, value: e.id })))
const houses = computed(() => houseStore.records.map((e) => ({ label: e.name, value: e.id })))
const className = computed(() => classes.value.find((c) => c.value === selectedClass.value)?.label || '')

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

const dirtyStudentIds = computed(() =>
    students.value.filter((s) => assignments.value[s.id] !== original.value[s.id]).map((s) => s.id)
)
const dirtyCount = computed(() => dirtyStudentIds.value.length)
const assignedCount = computed(() => students.value.filter((s) => assignments.value[s.id]).length)
const unassignedCount = computed(() => students.value.length - assignedCount.value)
const canRandomize = computed(() => !!selectedClass.value && houseStore.records.length > 0 && students.value.length > 0)

const placement = computed(() => {
    const total = students.value.length || 1
    return houseStore.records.map((h) => {
        const count = students.value.filter((s) => assignments.value[s.id] === h.id).length
        return { ...h, count, percent: Math.round((count / total) * 100) }
    })
})

function houseColor(id?: string) {
    return houseStore.records.find((h) => h.id === id)?.color
}

function isDirty(studentId: string) {
    return assignments.value[studentId] !== original.value[studentId]
}

function setHouse(studentId: string, houseId: string) {
    assignments.value[studentId] = houseId
}

function resetAssignments() {
    assignments.value = { ...original.value }
}

async function loadStudents(classId: string) {
    loading.value = true
    try {
        const { records } = await studentStore.getAllEnrollmentByClass(classId) as any
        students.value = records || []

        const seeded: Record<string, string | undefined> = {}
        for (const s of students.value) {
            seeded[s.id] = s.house?.id
        }
        assignments.value = seeded
        original.value = { ...seeded }
    } finally {
        loading.value = false
    }
}

watch(selectedClass, async (classId) => {
    if (!classId) {
        students.value = []
        assignments.value = {}
        original.value = {}
        return
    }
    await loadStudents(classId)
})

async function saveAssignments() {
    const records = dirtyStudentIds.value
        .filter((id) => assignments.value[id])
        .map((id) => ({ id, house: assignments.value[id] as string }))

    if (!records.length) return

    saving.value = true
    try {
        await houseStore.assign({ records })
        success(`${records.length} student${records.length > 1 ? 's' : ''} assigned to house${records.length > 1 ? 's' : ''} successfully`)
        if (selectedClass.value) await loadStudents(selectedClass.value)
    } catch (err: any) {
        error(err?.message || 'Failed to save house assignments')
    } finally {
        saving.value = false
    }
}

async function randomizeHouses() {
    if (!selectedClass.value) return

    randomizing.value = true
    try {
        await houseStore.randomAssign(selectedClass.value)
        success('Students randomly and evenly arranged into houses')
        confirmRandomOpen.value = false
        await loadStudents(selectedClass.value)
    } catch (err: any) {
        error(err?.message || 'Failed to randomly assign houses')
    } finally {
        randomizing.value = false
    }
}

onMounted(async () => {
    useAppStore().setTitle('Athletic Management')
    document.title = 'Athletic House Management | Skultem'
    await Promise.all([
        classStore.fetchAll(0, 0),
        houseStore.fetchAll(0, 0)
    ])
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
