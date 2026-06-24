<template>
    <div class="space-y-6 p-4">
        <!-- Header -->
        <UCard>
            <Heading title="Class Timetables"
                subtitle="Configure and manage weekly timetables for classes and sections">
                <div class="flex items-center gap-3 w-72">
                    <USelectMenu placeholder="Select Class" v-model="grade" value-key="value" :items="list"
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
                                {{ session?.clazz }} · {{ session?.sectionName }}
                            </h2>

                            <p class="text-sm text-muted">
                                {{ periods.length }} periods · Mon–Fri
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <UButton :loading="breakLoading" icon="i-lucide-coffee" color="neutral" variant="outline"
                            @click="addBreak">
                            Add Break
                        </UButton>

                        <UButton :loading="lunchLoading" icon="i-lucide-coffee" color="neutral" variant="outline"
                            @click="addLunch">
                            Add Lunch
                        </UButton>

                        <UButton :loading="addLoading" icon="i-lucide-plus" @click="addPeriod">
                            Add Period
                        </UButton>

                    </div>
                </div>
            </template>

            <div class="overflow-x-auto">

                <table class="min-w-full border-collapse text-sm">

                    <thead>
                        <tr class="border-b border-default bg-muted/30">

                            <th class="w-40 p-4 text-left font-medium text-muted">
                                Period
                            </th>

                            <th v-for="day in days" :key="day"
                                class="min-w-[180px] p-4 text-left font-medium text-muted">
                                {{ day }}
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        <tr v-for="(period, pIndex) in periods" :key="pIndex"
                            class="border-b border-default last:border-b-0">

                            <!-- Period -->
                            <td class="p-3 align-top">

                                <div class="flex h-full flex-col justify-center rounded-xl p-4"
                                    :class="(period.isBreak || period.isLunch) ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-muted/30'">

                                    <div class="flex items-center justify-between gap-2">
                                        <h4 class="font-semibold">
                                            {{ period.name }}
                                        </h4>
                                    </div>

                                    <p class="mt-1 flex items-center gap-1 text-xs text-muted">
                                        <UIcon name="i-lucide-clock" class="size-3" />
                                        <span>{{ period.startTime }}</span>
                                        <span>{{ period.endTime }}</span>
                                    </p>

                                </div>

                            </td>

                            <!-- Break row spans all days -->
                            <td v-if="period.isBreak" :colspan="days.length" class="p-3">
                                <div
                                    class="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                                    <UIcon name="i-lucide-coffee" class="size-4" />
                                    <span class="text-sm font-medium">Break — no classes scheduled</span>
                                </div>
                            </td>

                            <!-- Lunch row spans all days -->
                            <td v-if="period.isLunch" :colspan="days.length" class="p-3">
                                <div
                                    class="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                                    <UIcon name="i-lucide-coffee" class="size-4" />
                                    <span class="text-sm font-medium">Lunch — no classes scheduled</span>
                                </div>
                            </td>

                            <!-- Subjects -->
                            <template v-else>
                                <td v-for="(subject, index) in period.subjects" :key="index" class="p-3">

                                    <!-- Subject Card -->
                                    <button v-if="subject" type="button" class="group w-full text-left"
                                        @click="openSubject(period, index)">

                                        <div class="relative h-28 rounded-2xl border p-4 shadow transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                            :class="subject.color">

                                            <h4 class="font-semibold leading-tight">
                                                {{ subject.subject }}
                                            </h4>

                                            <div class="mt-3 space-y-1.5 text-xs text-muted">

                                                <div class="flex items-center gap-1.5">
                                                    <UIcon name="i-lucide-user-round" class="size-3.5" />
                                                    {{ subject.teacher || '—' }}
                                                </div>

                                                <div class="flex items-center gap-1.5">
                                                    <UIcon name="i-lucide-map-pin" class="size-3.5" />
                                                    {{ subject.room || '—' }}
                                                </div>

                                            </div>

                                            <UIcon name="i-lucide-pencil"
                                                class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />

                                        </div>

                                    </button>

                                    <!-- Empty Cell -->
                                    <button v-else type="button"
                                        class="flex h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        @click="addSubject(period, index)">

                                        <div class="flex flex-col items-center gap-1.5">

                                            <UIcon name="i-lucide-plus" class="size-5" />

                                            <span class="text-xs font-medium">
                                                Add Subject
                                            </span>

                                        </div>

                                    </button>

                                </td>
                            </template>

                        </tr>

                    </tbody>

                </table>

            </div>

        </UCard>

        <!-- Subject Modal -->
        <TimetableAddTimetable v-model:open="subjectModal" />
    </div>
</template>

<script setup lang="ts">
const store = useTimetableStore()
const classStore = useClassSessionStore()
const { periods, days } = storeToRefs(store)
const { list, loading: classLoading } = storeToRefs(classStore)
const grade = ref()


const addLoading = ref(false)
const breakLoading = ref(false)
const lunchLoading = ref(false)

const session = computed(() => classStore.get(grade.value))

const colorOptions = [
    { value: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900', swatch: 'bg-blue-200 dark:bg-blue-900' },
    { value: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900', swatch: 'bg-green-200 dark:bg-green-900' },
    { value: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900', swatch: 'bg-purple-200 dark:bg-purple-900' },
    { value: 'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900', swatch: 'bg-orange-200 dark:bg-orange-900' },
    { value: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900', swatch: 'bg-cyan-200 dark:bg-cyan-900' },
    { value: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900', swatch: 'bg-pink-200 dark:bg-pink-900' },
    { value: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900', swatch: 'bg-yellow-200 dark:bg-yellow-900' },
    { value: 'bg-primary/5 border-primary/20', swatch: 'bg-primary/30' }
]

const subjectModal = ref(false)
const isEditing = ref(false)

const selectedSubject = ref<any>({
    subject: '',
    teacher: '',
    room: '',
    color: colorOptions[0].value
})

const currentSlot = ref<{ period: any, index: number } | null>(null)

function openSubject(period: any, index: number) {
    const subject = period.subjects[index]
    selectedSubject.value = { ...subject }
    isEditing.value = true
    currentSlot.value = { period, index }
    subjectModal.value = true
}

function addSubject(period: any, index: number) {
    selectedSubject.value = {
        subject: '',
        teacher: '',
        room: '',
        color: colorOptions[0].value
    }
    isEditing.value = false
    currentSlot.value = { period, index }
    subjectModal.value = true
}

function saveSubject() {
    if (!currentSlot.value || !selectedSubject.value.subject) return

    currentSlot.value.period.subjects[currentSlot.value.index] = {
        ...selectedSubject.value
    }

    subjectModal.value = false
}

function deleteSubject() {
    if (!currentSlot.value) return

    currentSlot.value.period.subjects[currentSlot.value.index] = null

    subjectModal.value = false
}

async function addPeriod() {
    addLoading.value = true
    await store.createPeriod({ session: session.value?.id || '' })
    addLoading.value = false
}

async function addBreak() {
    breakLoading.value = true
    await store.createBreak({ session: session.value?.id || '' })
    breakLoading.value = false
}

async function addLunch() {
    lunchLoading.value = true
    await store.createLunch({ session: session.value?.id || '' })
    lunchLoading.value = false
}

function removePeriod(index: number) {
    periods.value.splice(index, 1)
}

watch(() => grade.value, async (value: string) => {
    if (value) {
        await store.getTimetable(value)
    }
}, { immediate: true })

watch(() => session.value, async (value: ClassSession) => {
    if (value) {
        await useClassSubjectStore().allByClass(value.clazzId, 0, 0)
    }
}, { immediate: true })

onMounted(async () => {
    await classStore.fetchAll(0, 0)
    await store.getWorkingDays()
    await store.searchRoom(0, 0)
})
</script>