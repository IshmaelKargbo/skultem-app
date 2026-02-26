<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Stream Subject Management</p>
                <div>
                    <UButton to="/curriculums/stream-subjects/add" color="primary" label="Assign Stream Subject" icon="hugeicons:assignments" />
                </div>
            </div>
            <CurriculumsStreamSubjectTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Stream Subjects')
    document.title = 'Stream Subjects | Curriculums | Skultem'
})
</script>