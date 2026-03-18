<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-xl font-semibold">Teacher Assignment Management</p>
                <div>
                    <UButton to="/curriculums/teacher-assignment/add" color="primary" label="Assign Teacher Subject"
                        :icon="ASSIGN_ICON" />
                </div>
            </div>
            <CurriculumsTeacherAssignmntTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Teacher Assignment')
    document.title = 'Teacher Assignment | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>