<template>
    <div class="p-4 md:px-6 space-y-4">
        <Heading title="Streams Management" subtitle="Manage all streams">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name. . ." />
                <ClassStreamAdd />
            </div>
        </Heading>
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
