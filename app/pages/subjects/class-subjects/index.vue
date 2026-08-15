<template>
    <div class="p-4 md:px-6 space-y-4">
        <Heading title="Class Subject Management" subtitle="Manage class subjects">
            <div class="flex space-x-2">
                <UInput placeholder="Search by class" />
                <UButton to="/subjects/class-subjects/add" color="primary" class="md:flex hidden"
                    label="Assign Class Subject" :icon="ASSIGN_ICON" />
                <UButton to="/subjects/class-subjects/add" color="primary" class="md:hidden" :icon="ASSIGN_ICON" />
            </div>
        </Heading>
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
