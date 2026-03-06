<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-xl font-semibold">Class Subject Management</p>
                <div>
                    <UButton to="/curriculums/class-subjects/add" color="primary" label="Assign Class Subject" icon="hugeicons:assignments" />
                </div>
            </div>
            <CurriculumsClassSubjectTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Class Subjects')
    document.title = 'Class Subjects | Curriculums | Skultem'
})
</script>