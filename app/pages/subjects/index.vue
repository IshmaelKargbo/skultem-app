<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4">
        <Heading title="Subjects Management" subtitle="Manage all subjects">
            <div class="flex space-x-3 ">
                <UInput placeholder="Search by name or code" />
                <SubjectAdd />
            </div>
        </Heading>
        <SubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subjects')
    document.title = 'Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
