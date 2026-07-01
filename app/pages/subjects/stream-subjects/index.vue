<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading class="hidden md:flex" title="Stream Subject Management" subtitle="Manage stream subjects">
                <UButton to="/subjects/stream-subjects/add" color="primary" label="Assign Stream Subject"
                    :icon="ASSIGN_ICON" />
            </Heading>
        </UCard>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Stream Subjects</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage stream subjects</p>
            </div>
            <UButton to="/subjects/stream-subjects/add" color="primary" size="sm" label="Assign" :icon="ASSIGN_ICON" />
        </div>
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
