<script setup lang="ts">
const { isAdmin } = defineProps<{
    isAdmin?: boolean
}>()
const store = useTimetableStore()
const { periods, periodLoading: loading, days } = storeToRefs(store)
const day = ref<string | undefined>()
const period = ref<string | undefined>()
const index = ref<string | undefined>()
const deleteModal = ref(false)

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
const isEditing = ref(true)

const selectPeriod = ref<Period>()
const selectedSubject = ref<any>({
    period: '',
    periodId: '',
    subject: '',
    room: '',
    color: colorOptions[0].value
})

const currentSlot = ref<{ period: any, index: string } | null>(null)

function openSubject(param: any, i: number) {
    if (!isAdmin) return
    period.value = param.id
    const subject = param.subjects[i]
    selectedSubject.value = { ...subject }

    const wd = store.getDay(i)
    index.value = i.toString()
    if (wd) day.value = wd.day

    isEditing.value = true
    currentSlot.value = { period, index: index.toString() }
    subjectModal.value = true
}

function deletePeriod(param: any) {
    selectPeriod.value = param
    deleteModal.value = true
}

function addSubject(param: any, i: number) {
    if (!isAdmin) return
    period.value = param.id
    selectedSubject.value = {
        subject: '',
        teacher: '',
        room: '',
        color: colorOptions[0].value
    }

    const wd = store.getDay(i)
    index.value = i.toString()
    if (wd) day.value = wd.day

    isEditing.value = false
    currentSlot.value = { period, i }
    subjectModal.value = true
}
</script>

<template>
    <div v-if="loading" class="space-y-3 p-2">
        <!-- Header Skeleton -->
        <div class="grid grid-cols-6 gap-3">
            <USkeleton class="h-12 rounded-xl" />
            <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-xl" />
        </div>

        <!-- Rows Skeleton -->
        <div v-for="row in 5" :key="row" class="grid grid-cols-6 gap-3">
            <!-- Period Column -->
            <USkeleton class="h-28 rounded-2xl" />

            <!-- Subject Columns -->
            <USkeleton v-for="col in 5" :key="`${row}-${col}`" class="h-28 rounded-2xl" />
        </div>
    </div>
    <table v-else class="min-w-full border-collapse text-sm">

        <thead>
            <tr class="border-b border-default bg-muted/30">

                <th class="w-40 p-4 text-left font-medium text-muted">
                    Period
                </th>

                <th v-for="day in days" :key="day" class="min-w-45 p-4 text-left font-medium text-muted">
                    {{ day }}
                </th>

            </tr>
        </thead>

        <tbody>
            <tr v-for="(period, pIndex) in periods" :key="pIndex" class="border-b border-default last:border-b-0">
                <!-- Period -->
                <td class="p-3 align-top">

                    <div class="flex h-full flex-col justify-center rounded-xl p-4"
                        :class="(period.isBreak || period.isLunch) ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-muted/30'">

                        <div class="flex items-center justify-between gap-2">
                            <h4 class="font-semibold">
                                {{ period.name }}
                            </h4>
                            <UButton vi variant="ghost" color="error" size="xs"
                                v-if="pIndex == (periods.length - 1) && isAdmin" :icon="DELETE_ICON"
                                @click="deletePeriod(period)" />
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

                                <UIcon v-if="isAdmin" name="i-lucide-pencil"
                                    class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        </button>

                        <!-- Empty Cell -->
                        <button v-else-if="isAdmin" type="button"
                            class="flex h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            @click="addSubject(period, index)">

                            <div class="flex flex-col items-center gap-1.5">

                                <UIcon name="i-lucide-plus" class="size-5" />

                                <span class="text-xs font-medium">
                                    Add Subject
                                </span>
                            </div>
                        </button>
                        <button v-else type="button"
                            class="flex h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            @click="addSubject(period, index)">

                            <div class="flex flex-col items-center gap-1.5">

                                <UIcon :name="isAdmin ? ADD_ICON : FREE_ICON" class="size-5" />

                                <span class="text-xs font-medium">
                                    Free Period
                                </span>
                            </div>
                        </button>
                    </td>
                </template>
            </tr>
        </tbody>
    </table>

    <!-- Subject Modal -->
    <TimetableAddTimetable :state="selectedSubject" :index="index" :period="period" :day="day"
        v-model:open="subjectModal" />
    <TimetableDeletePrompt v-model:open="deleteModal" :period-id="selectPeriod?.id || ''"
        :period-name="selectPeriod?.name || ''" />
</template>
