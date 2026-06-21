<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading class="hidden md:flex" title="Class Subject Management" subtitle="Manage class subjects">
            <UButton to="/subjects/class-subjects/add" color="primary" label="Assign Class Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Class Subjects</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage class subjects</p>
            </div>
            <UButton to="/subjects/class-subjects/add" color="primary" size="sm" label="Assign"
                :icon="ASSIGN_ICON" />
        </div>
        <SubjectClassSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Class Subjects')
    document.title = 'Class Subjects | Subject | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
