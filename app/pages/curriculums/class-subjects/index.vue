<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
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
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>