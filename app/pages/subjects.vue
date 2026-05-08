<template>
    <div class="md:p-5 py-2 md:py-4 p-4 overflow-y-auto h-full space-y-5">
        <Heading title="Subjects Management" subtitle="All active subjects" />
        <SubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subjects');

    document.title = 'Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>