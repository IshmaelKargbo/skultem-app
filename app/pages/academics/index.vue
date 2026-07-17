<template>
    <div class="p-4 space-y-4">
            <Heading title="Academic Year" subtitle="Configured academic sessions">
                <div class="flex space-x-2">
                    <UInput placeholder="Search by name. . ." />
                    <AcademicsAdd />
                </div>
            </Heading>
        <AcademicsTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Academics')
    document.title = 'Academic Years | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
