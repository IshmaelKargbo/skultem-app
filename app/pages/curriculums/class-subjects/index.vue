<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Class Subject Management" subtitle="Manage class subjects">
            <UButton to="/curriculums/class-subjects/add" color="primary" label="Assign Class Subject"
                :icon="ASSIGN_ICON" />
        </Heading>
        <CurriculumsClassSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Class Subjects')
    document.title = 'Class Subjects | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>