<template>
    <TeacherView>
        <UCard>
            <template #header>
                <div>
                    <h3 class="font-semibold text-lg">
                        Attendance
                    </h3>
                    <p class="text-sm text-muted">
                        Monthly attendance overview and daily records.
                    </p>
                </div>
            </template>
            <div class="space-y-4 md:space-y-6">
                <TeacherViewAttendanceCycle :teacher="teacher" />
            </div>
        </UCard>
    </TeacherView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const store = useTeacherStore()
const { record } = storeToRefs(store)
const teacher = computed(() => record.value)

onMounted(() => {
    useAppStore().setTitle('View Teacher')
    useAppStore().setBack('/teachers')

    document.title = 'Attendance | View Teacher | Teachers | Skultem'
})
</script>
