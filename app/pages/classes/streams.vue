<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading class="hidden md:flex" title="Streams Management" subtitle="Manage all streams">
                <ClassStreamAdd />
            </Heading>
            <div class="md:hidden flex items-center justify-between gap-3">
                <div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Streams</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Manage all streams</p>
                </div>
            </div>
        </UCard>

        <ClassStreamTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Classes')
    document.title = 'Streams | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
