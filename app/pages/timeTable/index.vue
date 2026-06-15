<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mt-8">

            <div>
                <h1 class="text-2xl font-bold tracking-tight">
                    Class Timetables
                </h1>
                <p class="mt-1 text-sm text-muted">
                    Manage weekly schedules by grade and section
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">

                <USelectMenu v-model="grade" :items="grades" icon="i-lucide-graduation-cap" class="w-36" />

                <USelectMenu v-model="section" :items="sections" icon="i-lucide-users" class="w-36" />

                <UButtonGroup>
                    <UButton icon="i-lucide-copy" color="neutral" variant="outline">
                        Copy
                    </UButton>
                    <UButton icon="i-lucide-download" color="neutral" variant="outline">
                        Export
                    </UButton>
                </UButtonGroup>

            </div>

        </div>

        <!-- Timetable -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">

            <template #header>
                <div class="flex items-center justify-between">

                    <div class="flex items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon name="i-lucide-calendar-days" class="size-5" />
                        </div>

                        <div>
                            <h2 class="font-semibold text-base">
                                {{ grade }} · {{ section }}
                            </h2>

                            <p class="text-sm text-muted">
                                {{ periods.length }} periods · Mon–Fri
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <UBadge color="primary" variant="subtle" icon="i-lucide-clock">
                            {{ week }}
                        </UBadge>

                        <UButton icon="i-lucide-coffee" color="neutral" variant="outline" @click="addBreak">
                            Add Lunch/Break
                        </UButton>

                        <UButton icon="i-lucide-plus" @click="addPeriod">
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
                                    :class="period.isBreak ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-muted/30'">

                                    <div class="flex items-center justify-between gap-2">
                                        <h4 class="font-semibold">
                                            {{ period.name }}
                                        </h4>

                                        <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs"
                                            class="-mr-1" @click="removePeriod(pIndex)" />
                                    </div>

                                    <p class="mt-1 flex items-center gap-1 text-xs text-muted">
                                        <UIcon name="i-lucide-clock" class="size-3" />
                                        {{ period.time }}
                                    </p>

                                </div>

                            </td>

                            <!-- Break row spans all days -->
                            <td v-if="period.isBreak" :colspan="days.length" class="p-3">
                                <div
                                    class="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                                    <UIcon name="i-lucide-coffee" class="size-4" />
                                    <span class="text-sm font-medium">Lunch / Break — no classes scheduled</span>
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
        <UModal v-model:open="subjectModal" :ui="{ footer: 'justify-end' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">
                        {{ isEditing ? 'Edit Subject' : 'Add Subject' }}
                    </h3>

                    <UButton v-if="isEditing" color="error" variant="ghost" icon="i-lucide-trash" size="sm"
                        @click="deleteSubject" />
                </div>
            </template>

            <template #body>
                <div class="space-y-4">

                    <UFormField label="Subject">
                        <USelectMenu v-model="selectedSubject.subject" :items="subjects"
                            placeholder="Select a subject" class="w-full" />
                    </UFormField>

                    <UFormField label="Teacher">
                        <UInput v-model="selectedSubject.teacher" placeholder="Teacher name"
                            icon="i-lucide-user-round" class="w-full" />
                    </UFormField>

                    <UFormField label="Room">
                        <UInput v-model="selectedSubject.room" placeholder="Room" icon="i-lucide-map-pin"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Color">
                        <div class="flex flex-wrap gap-2">
                            <button v-for="(opt, i) in colorOptions" :key="i" type="button"
                                class="size-8 rounded-full border-2 transition-transform" :class="[
                                    opt.swatch,
                                    selectedSubject.color === opt.value ? 'border-primary scale-110' : 'border-transparent'
                                ]" @click="selectedSubject.color = opt.value" />
                        </div>
                    </UFormField>

                </div>
            </template>

            <template #footer="{ close }">
                <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
                <UButton label="Save Changes" :disabled="!selectedSubject.subject" @click="saveSubject" />
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
const grade = ref('Grade 10')
const section = ref('Section A')
const week = ref('Current Week')

const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
const sections = ['Section A', 'Section B', 'Section C']
const weeks = ['Current Week']

const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
]

const subjects = [
    'Mathematics',
    'English',
    'Chemistry',
    'Physics',
    'Biology',
    'History',
    'Geography',
    'Computer Science'
]

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

const periods = ref<any[]>([
    {
        name: 'Period 1',
        time: '09:00 - 09:45',
        isBreak: false,
        subjects: [
            {
                subject: 'Mathematics',
                teacher: 'Dr Wilson',
                room: 'Room 101',
                color: colorOptions[0].value
            },
            {
                subject: 'Chemistry',
                teacher: 'Ms Rodriguez',
                room: 'Lab 1',
                color: colorOptions[1].value
            },
            {
                subject: 'English',
                teacher: 'Mr Anderson',
                room: 'Room 201',
                color: colorOptions[2].value
            },
            {
                subject: 'History',
                teacher: 'Mr Chen',
                room: 'Room 301',
                color: colorOptions[3].value
            },
            {
                subject: 'Computer Science',
                teacher: 'Mr Thompson',
                room: 'Computer Lab',
                color: colorOptions[4].value
            }
        ]
    }
])

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

function addPeriod() {
    periods.value.push({
        name: `Period ${periods.value.length + 1}`,
        time: '00:00 - 00:00',
        isBreak: false,
        subjects: Array.from({ length: days.length }, () => null)
    })
}

function addBreak() {
    periods.value.push({
        name: 'Lunch Break',
        time: '12:00 - 12:45',
        isBreak: true,
        subjects: []
    })
}

function removePeriod(index: number) {
    periods.value.splice(index, 1)
}
</script>