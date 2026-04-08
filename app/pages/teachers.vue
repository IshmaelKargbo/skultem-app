<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Teachers Management" subtitle="Manage all teachers">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name" />
                <TeacherAdd />
            </div>
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