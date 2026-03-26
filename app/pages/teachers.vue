<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Teachers Management" subtitle="Manage all teachers">
            <TeacherAdd />
        </Heading>
        <TeacherTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Teachers');

    document.title = 'Teachers | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>