<template>
    <div class="space-y-4 p-4 sm:space-y-5 md:px-6 ">
        <Heading title="Class Management" subtitle="Organize academic classes">
            <div class="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-start lg:gap-3">
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
