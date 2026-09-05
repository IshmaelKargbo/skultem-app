<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">
                            Attendance
                        </h3>
                        <p class="text-sm text-muted">
                            Monthly attendance overview and daily records.
                        </p>
                    </div>
                </div>
            </template>
            <div class="space-y-4 md:space-y-6">
                <StudentViewAttendanceCycle :student="student" />
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const route = useRoute()
const store = useStudentStore()
const { record } = storeToRefs(store)
const student = computed(() => record.value)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'Attendance | View Student | Students | Skultem'
})
</script>
