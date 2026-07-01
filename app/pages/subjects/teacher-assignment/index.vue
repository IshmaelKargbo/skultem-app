<template>
    <div class="p-4 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <UCard>
            <Heading class="hidden md:flex" title="Teacher Assignment" subtitle="Manage teacher assignment">
                <UButton to="/subjects/teacher-assignment/add" color="primary" label="Assign Teacher Subject"
                    :icon="ASSIGN_ICON" />
            </Heading>
        </UCard>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Teacher Assignment</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage teacher assignment</p>
            </div>
            <UButton to="/subjects/teacher-assignment/add" color="primary" size="sm" label="Assign"
                :icon="ASSIGN_ICON" />
        </div>
        <ClassTeacherAssignmntTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subjects')
    document.title = 'Teacher Assignment | Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
