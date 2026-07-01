<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading title="Subjects Management" subtitle="All active subjects" />
        </UCard>
        <SubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Assignment');

    document.title = 'Assignment | Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
