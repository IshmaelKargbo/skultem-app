<template>
    <TeacherView>
        <div class="space-y-6">

            <template v-if="loading">
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
                </div>
            </template>

            <template v-else-if="progress">

                <!-- Statistics -->
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric :record="{
                        color: 'success',
                        value: `${progress.coverage}%`,
                        icon: 'i-lucide-chart-column',
                        label: 'Coverage',
                        isReady: !loading
                    }" />
                    <Metric :record="{
                        color: 'info',
                        value: progress.subjects,
                        icon: SUBJECT_ICON,
                        label: 'Subjects',
                        isReady: !loading
                    }" />
                    <Metric :record="{
                        color: 'warning',
                        value: progress.classes,
                        icon: CLASS_ICON,
                        label: 'Classes',
                        isReady: !loading
                    }" />
                    <Metric :record="{
                        color: 'error',
                        value: progress.totalWeeks - progress.completedWeeks,
                        icon: WARNING_ICON,
                        label: 'Pending Weeks',
                        isReady: !loading
                    }" />
                </div>

                <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

                    <!-- Sidebar -->
                    <div class="space-y-6 xl:sticky xl:top-6 self-start">
                        <UCard>
                            <template #header>
                                <span class="font-semibold">Overall Progress</span>
                            </template>

                            <div class="mb-2 flex justify-between">
                                <span class="text-sm text-muted">Curriculum Coverage</span>
                                <span class="font-semibold">{{ progress.coverage }}%</span>
                            </div>

                            <UProgress :model-value="progress.coverage" size="lg" />

                            <div class="mt-4 flex items-center justify-between rounded-xl border border-default p-3">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-book-check" class="text-orange-500" />
                                    <span class="text-sm text-muted">Lesson Notes Written</span>
                                </div>
                                <span class="font-bold">{{ progress.lessonNotes }}</span>
                            </div>
                        </UCard>

                        <UButton block variant="outline" color="neutral" icon="i-lucide-external-link"
                            :to="`/curriculums/teacher-progress/${id}`" label="Full Progress Report" />
                    </div>

                    <!-- Subject coverage -->
                    <UCard>
                        <template #header>
                            <span class="font-semibold">Subject Coverage</span>
                        </template>

                        <div v-if="progress.subjectCoverage.length" class="space-y-3">
                            <div v-for="subject in progress.subjectCoverage" :key="subject.subject" class="border-b border-default pb-3 last:border-0">
                                <div class="mb-2 flex justify-between">
                                    <div>
                                        <p class="font-medium">{{ subject.subject }} <span class="text-xs text-muted">( {{ subject.classes }} )</span>
                                        </p>
                                        <p class="text-sm text-muted">{{ subject.completedWeeks }} of {{ subject.totalWeeks }} weeks covered</p>
                                    </div>
                                    <span class="font-semibold">{{ subject.coverage }}%</span>
                                </div>

                                <UProgress :model-value="subject.coverage" />
                            </div>
                        </div>

                        <p v-else class="text-sm text-muted">No scheme of work assigned to this teacher yet.</p>
                    </UCard>
                </div>

            </template>

            <UCard v-else class="py-16">
                <div class="text-center">
                    <UIcon name="i-lucide-chart-column" class="mx-auto text-5xl text-muted" />
                    <h3 class="mt-4 text-lg font-semibold">No curriculum data yet</h3>
                </div>
            </UCard>
        </div>
    </TeacherView>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)

const loading = ref(true)
const progress = ref<TeacherProgressDetail>()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

watch(
    () => route.params.id,
    async (teacherId) => {
        if (!teacherId) return

        loading.value = true
        try {
            progress.value = await CurriculumsApi().getTeacherProgressDetail(teacherId as string)
        } finally {
            loading.value = false
        }

        useAppStore().setTitle('Teacher Curriculum Progress')
        useAppStore().setBack('/teachers')

        document.title = 'Curriculum Progress | Teachers | Skultem'
    },
    { immediate: true }
)
</script>
