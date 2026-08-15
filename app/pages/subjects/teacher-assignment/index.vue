<template>
    <div class="p-4 md:px-6 space-y-4">
        <Heading title="Teacher Assignment" subtitle="Manage teacher assignment">
            <div class="flex items-center space-x-2">
                <UInput placeholder="Search by teacher name" />
                <UButton to="/subjects/teacher-assignment/add" class="md:flex hidden justify-center" color="primary"
                    label="Assign Teacher Subject" :icon="ASSIGN_ICON" />
                <UButton to="/subjects/teacher-assignment/add" class="md:hidden" color="primary"
                     :icon="ASSIGN_ICON" />
            </div>
        </Heading>
        <SubjectTeacherAssignmntTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Teacher Assignment')
    document.title = 'Teacher Assignment | Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
