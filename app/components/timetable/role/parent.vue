<template>
    <div class="space-y-4 px-4 md:px-6">
        <Heading title="Class Timetables" subtitle="Manage weekly timetables for classes and sections">
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <USelectMenu placeholder="Select Student" v-model="grade" value-key="value" :items="list"
                    :loading="classLoading" class="w-full md:w-72" />
            </div>
        </Heading>

        <!-- Timetable -->
        <UCard v-if="session" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UIcon name="i-lucide-calendar-days" class="size-5" />
                    </div>

                    <div class="min-w-0">
                        <h2 class="truncate font-semibold text-base">
                            {{ session?.className }}
                        </h2>

                        <p class="text-sm text-muted">
                            {{ periods.length }} periods · {{ store.getDayRange }}
                        </p>
                    </div>
                </div>
            </template>

            <TimetablePeriod />
        </UCard>
        <UCard v-else>
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <UIcon name="i-lucide-school" class="size-12 text-muted mb-3" />

                <h3 class="text-base font-semibold">
                    Select a class to continue
                </h3>

                <p class="text-sm text-muted mt-1">
                    Choose a class from the dropdown to view or create its timetable.
                </p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useTimetableStore()

const parentStore = useParentStore()
const teacherStore = useTeacherSubjectStore()
const { periods } = storeToRefs(store)

const { list, loading: classLoading } = storeToRefs(parentStore)
const grade = ref('')

const session = computed(() => teacherStore.getClass(grade.value))

function syncGrade(items: { value: string }[]) {
    if (!items.length) return

    const exists = items.some(item => item.value === grade.value)
    if (!exists) {
        grade.value = items[0].value
    }
}

watch(() => grade.value, async (value: string) => {
    if (!value) return

    try {
        await store.getTimetable(value)
    } catch (error: any) {
        useNotify().error(error)
    }
}, { immediate: true })


watch(list, syncGrade, { immediate: true })

onMounted(async () => {
    document.title = 'Timetable | Skultem'
    try {
        await Promise.all([
            teacherStore.allByTeacher(),
            parentStore.fetchAllStudents(0, 0),
            store.getWorkingDays(),
            store.searchRoom(0, 0)
        ])
    } catch (error: any) {
        useNotify().error(error)
    }
})
</script>
