<template>
    <TeacherView>
        <UCard class="overflow-hidden">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
                            <h3 class="text-lg font-semibold">
                                Subjects & Classes
                            </h3>
                        </div>

                        <p class="text-sm text-muted">
                            Subjects and classes assigned to this teacher.
                        </p>
                    </div>

                    <UBadge variant="soft" color="neutral">{{ subjects.length }}</UBadge>
                </div>
            </template>

            <div v-if="loading" class="space-y-3">
                <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-2xl" />
            </div>

            <div v-else-if="subjects.length" class="space-y-3">
                <div
                    v-for="assignment in subjects"
                    :key="assignment.id"
                    class="flex flex-col gap-3 rounded-2xl border border-default p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <UIcon name="i-lucide-book-open" class="text-primary" />
                        </div>

                        <div>
                            <p class="font-semibold">{{ assignment.subjectName }}</p>
                            <p class="text-sm text-muted">
                                {{ assignment.className }}
                                <template v-if="assignment.sectionName"> &middot; {{ assignment.sectionName }}</template>
                                <template v-if="assignment.streamName"> &middot; {{ assignment.streamName }}</template>
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 text-xs text-dimmed">
                        <UIcon name="i-lucide-calendar" class="size-3.5" />
                        Assigned {{ formatDate(assignment.assignedAt) }}
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center gap-2 py-14 text-center">
                <UIcon name="i-lucide-book-open" class="text-4xl text-muted" />
                <p class="text-sm text-muted">No subjects assigned to this teacher yet.</p>
            </div>
        </UCard>
    </TeacherView>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useTeacherStore()

const subjects = ref<TeacherSubject[]>([])
const loading = ref(true)

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

watch(
    () => route.params.id,
    async (teacherId) => {
        if (!teacherId) return

        loading.value = true
        try {
            subjects.value = await store.fetchSubjects(teacherId as string) as any || []
        } finally {
            loading.value = false
        }

        useAppStore().setTitle('Teacher Subjects')
        useAppStore().setBack('/teachers')

        document.title = 'Subjects & Classes | Teachers | Skultem'
    },
    { immediate: true }
)
</script>
