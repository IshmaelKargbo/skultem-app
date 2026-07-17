<template>
    <div class="p-4 space-y-4">
        <Heading title="Sections Management" subtitle="Manage all sections">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name. . ." />
                <ClassSectionAdd />
            </div>
        </Heading>
        <ClassSectionTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Sections')
    document.title = 'Sections | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
