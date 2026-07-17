<template>
    <div class="p-4 overflow-y-auto h-full space-y-4">
        <Heading title="Subject Groups Management" subtitle="Manage all subject groups">
            <div class="space-x-2 flex items-center">
                <UInput placeholder="Search by name. . ." />
                <SubjectGroupAdd />
            </div>
        </Heading>
        <SubjectGroupTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subject Groups');

    document.title = 'Subject Groups | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
