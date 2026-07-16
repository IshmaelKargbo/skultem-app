<template>
    <div class="p-4 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <UCard>
            <Heading title="Teacher Assignment" subtitle="Manage teacher assignment">
                <UButton to="/subjects/teacher-assignment/add" class="flex justify-center" color="primary" label="Assign Teacher Subject"
                    :icon="ASSIGN_ICON" />
            </Heading>
        </UCard>
        <ClassTeacherAssignmntTable />
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
