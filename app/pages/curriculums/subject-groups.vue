<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Subject Groups Management" subtitle="Manage all subject groups">
            <CurriculumsSubjectGroupAdd />
        </Heading>

        <CurriculumsSubjectGroupTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subject Groups');

    document.title = 'Subject Groups | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>