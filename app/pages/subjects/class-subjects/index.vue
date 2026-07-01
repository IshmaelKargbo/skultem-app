<template>
    <div class="p-4 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <UCard>
            <Heading title="Class Subject Management" subtitle="Manage class subjects">
                <UButton to="/subjects/class-subjects/add" color="primary" label="Assign Class Subject"
                    :icon="ASSIGN_ICON" />
            </Heading>
        </UCard>
        <SubjectClassSubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Class Subjects')
    document.title = 'Class Subjects | Subject | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
