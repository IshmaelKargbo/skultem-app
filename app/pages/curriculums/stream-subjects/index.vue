<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Stream Subject Management" subtitle="Manage stream subjects">
            <UButton to="/curriculums/stream-subjects/add" color="primary" label="Assign Stream Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
        <CurriculumsStreamSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Stream Subjects')
    document.title = 'Stream Subjects | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>