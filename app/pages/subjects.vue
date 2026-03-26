<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
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