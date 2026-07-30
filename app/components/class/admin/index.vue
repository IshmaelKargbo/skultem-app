<template>
    <div class="space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-7">
        <Heading title="Class Management" subtitle="Organize academic classes">
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-start md:gap-3">
                <div class="grid w-full grid-cols-2 gap-3 sm:w-auto">
                    <ClassAssignMaster />
                    <ClassAdd />
                </div>
                <UInput class="w-full md:hidden" placeholder="Search by name" />
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
