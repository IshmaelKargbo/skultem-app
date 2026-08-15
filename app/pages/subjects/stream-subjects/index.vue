<template>
    <div class="md:px-6 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <Heading title="Stream Subject Management" subtitle="Manage stream subjects">
            <div class="flex items-center space-x-2">
                <UInput placeholder="Search by stream. . ." />
                <UButton to="/subjects/stream-subjects/add" class="md:flex hidden" color="primary"
                    label="Assign Stream Subject" :icon="ASSIGN_ICON" />
                <UButton to="/subjects/stream-subjects/add" color="primary" class="md:hidden" :icon="ASSIGN_ICON" />
            </div>
        </Heading>
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
