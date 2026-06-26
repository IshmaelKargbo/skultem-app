<template>
    <div class="p-4 overflow-y-auto h-full space-y-4">
        <UCard>
            <Heading title="Subjects Management" subtitle="Manage all subjects">
                <div class="flex md:space-x-3 space-y-3 md:space-y-0 flex-col md:flex-row">
                    <UInput placeholder="Search by name or code" />
                <SubjectAdd />
                </div>
            </Heading>
        </UCard>
        <SubjectTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Curriculums')
    document.title = 'Subjects | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
