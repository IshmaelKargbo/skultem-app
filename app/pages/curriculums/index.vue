<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Subjects Management" subtitle="Manage all subjects">
            <CurriculumsSubjectAdd />
        </Heading>
        <CurriculumsSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Curriculums')
    document.title = 'Subjects | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>