<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading class="hidden md:flex" title="Subjects Management" subtitle="Manage all subjects">
                <SubjectAdd />
            </Heading>
            <div class="md:hidden flex items-center justify-between gap-3">
                <div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Subjects</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Manage all subjects</p>
                </div>
                <SubjectAdd />
            </div>
        </UCard>
        <SubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subjects')
    document.title = 'Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
