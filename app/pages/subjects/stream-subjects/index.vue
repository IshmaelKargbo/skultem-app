<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading title="Stream Subject Management" subtitle="Manage stream subjects">
                <UButton to="/subjects/stream-subjects/add" color="primary" label="Assign Stream Subject"
                    :icon="ASSIGN_ICON" />
            </Heading>
        </UCard>
        <SubjectStreamSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Stream Subjects')
    document.title = 'Stream Subjects | Subject | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
