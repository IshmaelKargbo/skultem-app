<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Teacher Assignment" subtitle="Manage teacher assignment">
            <UButton to="/curriculums/teacher-assignment/add" color="primary" label="Assign Teacher Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
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