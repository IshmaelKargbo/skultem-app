<template>
    <div class="space-y-3 px-4 md:px-6">
        <Heading title="Timetable" subtitle="Your child's weekly lessons.">
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <USelectMenu data-guide="par-child" placeholder="Select Student" v-model="grade" value-key="value" :items="list"
                    :loading="classLoading" class="w-full md:w-72" />
                <div data-guide="par-download"><TimetableDownload v-if="session" :title="session.className" /></div>
            </div>
        </Heading>

        <GuideBar topic="parent-timetable" />
        <!-- A class follows a weekly plan or the normal timetable, never both. -->
        <UCard v-if="session && session.weeklyPlan">
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <UIcon name="i-lucide-calendar-range" class="mb-3 size-12 text-muted" />
                <h3 class="text-base font-semibold">{{ session.className }} follows a weekly plan</h3>
                <p class="mt-1 max-w-md text-sm text-muted">The class doesn't have a lesson-by-lesson timetable. Its weekly
                    plan shows the subjects for each day of this week and next.</p>
                <UButton class="mt-4" to="/timetable/weekly-plan" label="Open the weekly plan" icon="i-lucide-calendar-range"
                    variant="soft" />
            </div>
        </UCard>
        <!-- Timetable -->
        <UCard data-guide="par-timetable" v-else-if="session" :ui="{ body: 'p-0 sm:p-0' }">
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
                    Choose your child
                </h3>

                <p class="text-sm text-muted mt-1">
                    Pick your child above to see their class timetable.
                </p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useTimetableStore()

const parentStore = useParentStore()
const { periods } = storeToRefs(store)

const { list, loading: classLoading } = storeToRefs(parentStore)
const grade = ref('')

// The chosen child's class (the picker's value is their class session).
const session = computed(() => {
    const child = parentStore.students.find(s => s.sessionId === grade.value)
    return child ? { className: child.className, weeklyPlan: isWeeklyPlan(child.classId) } : undefined
})
// A class follows the normal timetable or a weekly plan, never both. The child picked is shared with the Weekly
// plan page; a child whose class is on a weekly plan gets a card pointing to it.
const { isWeeklyPlan, load: loadTypes, types, typeOfSession, selected } = useClassTimetableTypes()
onMounted(() => { loadTypes(true).catch(() => null) })

// The child picked before (here or on the Weekly plan page), else the first on the normal timetable.
function syncGrade(items: { value: string }[]) {
    if (!items.length || !types.value) return
    if (items.some(item => item.value === grade.value)) return
    // Opening the page keeps the class picked before only if it's on the normal timetable (one on a weekly plan would
  // send you straight back to its plan).
  const kept = items.find((item) => item.value === selected.value && typeOfSession(item.value) === 'PERIODS')
    grade.value = (kept ?? items.find(item => typeOfSession(item.value) === 'PERIODS') ?? items[0])!.value
}

watch(() => grade.value, async (value: string) => {
    if (!value) return
    selected.value = value
    if (typeOfSession(value) === 'WEEKLY_PLAN') {
      // A class on a weekly plan has no timetable: straight to its plan (the Weekly plan page opens on it).
      await navigateTo('/timetable/weekly-plan', { replace: true })
      return
    }

    try {
        await Promise.all([
            store.getTimetable(value),
            store.getWorkingDays({ session: value })
        ])
    } catch (error: any) {
        useNotify().error(error)
    }
}, { immediate: true })


watch([list, types], () => syncGrade(list.value), { immediate: true })

onMounted(async () => {
    document.title = 'Timetable | Skultem'
    try {
        await Promise.all([
            parentStore.fetchAllStudents(0, 0),
            store.searchRoom(0, 0)
        ])
    } catch (error: any) {
        useNotify().error(error)
    }
})
</script>
