<template>
    <div class="md:p-7 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <Heading title="Academic Year" subtitle="Configured academic sessions">
            <AcademicsAdd />
        </Heading>
        <SettingsTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Academics')
    document.title = 'Academic Years | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
