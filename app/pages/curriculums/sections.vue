<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading class="hidden md:flex" title="Sections Management" subtitle="Manage all sections">
            <CurriculumsSectionAdd />
        </Heading>
        <div class="md:hidden flex items-center justify-between gap-3">
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Sections</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Manage all sections</p>
            </div>
            <CurriculumsSectionAdd />
        </div>
        <CurriculumsSectionTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Curriculums')
    document.title = 'Sections | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
