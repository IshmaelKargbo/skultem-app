<template>
    <div class="md:p-7 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <Heading title="Class Management" subtitle="Organize academic classes">
            <div class="flex md:space-x-3 flex-wrap space-y-2 md:space-y-0 w-full md:w-1/3">
                <div class="grid grid-cols-2 w-full gap-3">
                    <ClassAssignMaster />
                    <ClassAdd />
                </div>
                <UInput class="md:hidden" placeholder="Search by name" />
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