<template>
    <div class="space-y-4 px-4 md:px-6">
        <Heading title="My Timetable" subtitle="View your weekly teaching schedule across your classes">
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <USelectMenu
                    v-model="grade"
                    placeholder="Select Class"
                    value-key="value"
                    :items="list"
                    :loading="classLoading"
                    class="w-full md:w-72"
                />
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
        useNotify().error(error?.message || error)
    }
}, { immediate: true })

watch(list, syncGrade, { immediate: true })

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
        await store.getWorkingDays()
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
