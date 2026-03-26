<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Class Management" subtitle="Organize academic classes">
            <div class="flex space-x-3">
                <ClassAssignMaster />
                <ClassAdd />
            </div>
        </Heading>
        <ClassTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Classes');
    document.title = 'Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT]
})
</script>