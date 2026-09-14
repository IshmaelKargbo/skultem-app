<template>
    <StudentView>
        <UCard :ui="{
            body: 'p-0 md:p-0'
        }">
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold md:text-lg">
                            Attendance
                        </h3>
                        <p class="text-xs-base text-muted">
                            Monthly attendance overview and daily records.
                        </p>
                    </div>
                </div>
            </template>
            <div class="space-y-4">
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
