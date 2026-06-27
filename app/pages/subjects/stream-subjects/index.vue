<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
