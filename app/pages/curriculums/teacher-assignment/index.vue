<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading class="hidden md:flex" title="Teacher Assignment" subtitle="Manage teacher assignment">
            <UButton to="/curriculums/teacher-assignment/add" color="primary" label="Assign Teacher Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Teacher Assignment</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage teacher assignment</p>
            </div>
            <UButton to="/curriculums/teacher-assignment/add" color="primary" size="sm" label="Assign"
                :icon="ASSIGN_ICON" />
        </div>
        <CurriculumsTeacherAssignmntTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Curriculums')
    document.title = 'Teacher Assignment | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
