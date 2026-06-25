<template>
    <div class="space-y-6 p-4">
        <!-- Header -->
        <UCard>
            <Heading title="Class Timetables"
                subtitle="Manage weekly timetables for classes and sections">
                <div class="flex items-center gap-3 w-72">
                    <USelectMenu placeholder="Select Class" v-model="grade" value-key="value" :items="classes"
                        :loading="classLoading" />
                </div>
            </Heading>
        </UCard>

        <!-- Timetable -->
        <UCard v-if="session" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center justify-between">

                    <div class="flex items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon name="i-lucide-calendar-days" class="size-5" />
                        </div>

                        <div>
                            <h2 class="font-semibold text-base">
                                {{ session?.className }}
                            </h2>

                            <p class="text-sm text-muted">
                                {{ periods.length }} periods · {{ store.getDayRange }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>

            <div class="overflow-x-auto">
                <TimetablePeriod />
            </div>
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

const teacherStore = useTeacherSubjectStore()
const { periods } = storeToRefs(store)
const { classes, loading: classLoading } = storeToRefs(teacherStore)
const grade = ref()

const session = computed(() => teacherStore.getClass(grade.value))


watch(() => grade.value, async (value: string) => {
    if (value) {
        await store.getTimetable(value)
    }
}, { immediate: true })

onMounted(async () => {
    document.title = 'Timetable | Skultem'
    await teacherStore.allByTeacher()
    await store.getWorkingDays()
    await store.searchRoom(0, 0)
})
</script>