<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading class="hidden md:flex" title="Class Subject Management" subtitle="Manage class subjects">
            <UButton to="/curriculums/class-subjects/add" color="primary" label="Assign Class Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Class Subjects</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage class subjects</p>
            </div>
            <UButton to="/curriculums/class-subjects/add" color="primary" size="sm" label="Assign"
                :icon="ASSIGN_ICON" />
        </div>
        <CurriculumsClassSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Class Subjects')
    document.title = 'Class Subjects | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
