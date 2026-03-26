<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
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
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>