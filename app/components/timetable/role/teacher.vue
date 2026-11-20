<template>
    <div class="space-y-3 px-4 md:px-6">
        <Heading title="My Timetable" subtitle="View your weekly teaching schedule across your classes">
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div class="flex justify-end"><GuideButton guide="teacher-timetable" /><HelpButton topic="teacher-timetable" /></div>
                <USelectMenu
                    data-guide="teacher-timetable-class"
                    v-model="grade"
                    placeholder="Select Class"
                    value-key="value"
                    :items="list"
                    :loading="classLoading"
                    class="w-full md:w-72"
                />
                <TimetableDownload v-if="session && !onWeeklyPlan" data-guide="teacher-timetable-download" :title="`${session.className}${session.sectionName ? ` (${session.sectionName})` : ''}`" />
            </div>
        </Heading>

        <TimetableSectionNav />

        <!-- A class follows a weekly plan or the normal timetable, never both. -->
        <UCard v-if="session && onWeeklyPlan">
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <UIcon name="i-lucide-calendar-range" class="mb-3 size-12 text-muted" />
                <h3 class="text-base font-semibold">{{ session.className }} follows a weekly plan</h3>
                <p class="mt-1 max-w-md text-sm text-muted">It is planned week by week, so it has no lesson-by-lesson
                    timetable.</p>
                <UButton class="mt-4" to="/timetable/weekly-plan" label="Open its weekly plan" icon="i-lucide-calendar-range" />
            </div>
        </UCard>
        <!-- Timetable -->
        <UCard v-else-if="session" data-guide="teacher-timetable-grid" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UIcon name="i-lucide-calendar-days" class="size-5" />
                    </div>

                    <div class="min-w-0">
                        <h2 class="truncate font-semibold text-base">
                            {{ session?.className }} · {{ session?.sectionName }}
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
                <UIcon name="i-lucide-school" class="mb-3 size-12 text-muted" />

                <h3 class="text-base font-semibold">
                    Select a class to continue
                </h3>

                <p class="mt-1 text-sm text-muted">
                    Choose one of your classes from the dropdown to view its timetable.
                </p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useTimetableStore()
const teacherSubjectStore = useTeacherSubjectStore()
const route = useRoute()

const { periods } = storeToRefs(store)
const { records: teacherSubjectRecords } = storeToRefs(teacherSubjectStore)
// Pre-selected from a dashboard class card's "Timetable" link (?session=<id>) when present.
const grade = ref(String(route.query.session ?? ''))

const classLoading = ref(true)

// A class master with no subject assigned in their own class never shows up in
// teacherSubjectStore's records (subject-teaching sessions only), so their own class was
// missing from this dropdown entirely - merge in their class-master sessions too, deduped by
// session, same as the curriculum/roster fixes elsewhere in this app.
const classMasterAssignments = ref<TeacherClassMaster[]>([])

const sessionsById = computed(() => {
    const map = new Map<string, { className: string, sectionName: string }>()

    for (const r of teacherSubjectRecords.value) {
        if (!map.has(r.sessionId)) map.set(r.sessionId, { className: r.className, sectionName: r.sectionName })
    }

    for (const a of classMasterAssignments.value) {
        if (!map.has(a.sessionId)) map.set(a.sessionId, { className: a.className, sectionName: '' })
    }

    return map
})

const list = computed(() =>
    Array.from(sessionsById.value.entries()).map(([sessionId, info]) => ({
        label: info.sectionName ? `${info.className} (${info.sectionName})` : info.className,
        value: sessionId
    }))
)

const session = computed(() => sessionsById.value.get(grade.value))

// A class follows the normal timetable or a weekly plan, never both. The class picked is shared with the Weekly
// plan page; a class on a weekly plan gets a card pointing to it.
const { load: loadTypes, types, typeOfSession, selected } = useClassTimetableTypes()
const onWeeklyPlan = computed(() => !!grade.value && !!types.value && typeOfSession(grade.value) === 'WEEKLY_PLAN')
onMounted(() => { loadTypes(true).catch(() => null) })

// The class picked before (from a link, here or on the Weekly plan page), else the first on the normal timetable.
function syncGrade(items: { value: string }[]) {
    if (!items.length || !types.value) return
    if (items.some(item => item.value === grade.value)) return
    // Opening the page keeps the class picked before only if it's on the normal timetable (one on a weekly plan would
  // send you straight back to its plan).
  const kept = items.find((item) => item.value === selected.value && typeOfSession(item.value) === 'PERIODS')
    grade.value = (kept ?? items.find(item => typeOfSession(item.value) === 'PERIODS') ?? items[0])!.value
}

watch([() => grade.value, types], async ([value]) => {
    if (!value) return
    if (!types.value) return // decided once the types are in
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
        useNotify().error(error?.message || error)
    }
}, { immediate: true })

watch([list, types], () => syncGrade(list.value), { immediate: true })

onMounted(async () => {
    useAppStore().setTitle('My Timetable')
    document.title = 'My Timetable | Skultem'
    classLoading.value = true
    try {
        await Promise.all([
            teacherSubjectStore.allByTeacher(),
            TeacherApi().getMyClassMasterAssignments().then(res => {
                classMasterAssignments.value = res || []
            })
        ])
    } catch (error: any) {
        useNotify().error(error?.message || error)
    } finally {
        classLoading.value = false
    }
})

definePageMeta({
    role: [Role.TEACHER]
})
</script>
