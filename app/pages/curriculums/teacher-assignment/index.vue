<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
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
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>