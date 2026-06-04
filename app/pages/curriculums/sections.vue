<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
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
