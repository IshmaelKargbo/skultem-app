<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
