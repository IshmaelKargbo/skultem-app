<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Categroies | Materials | Skultem'
})

// Missing entirely before - see material/index.vue's guard for why.
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6  overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Supplies" subtitle="Manage and track school supply records">
            <div class="flex space-x-3">
                <UInput placeholder="Search by student name" />
                <MaterialSupplyGive />
            </div>
        </Heading>
        <MaterialSupplyTable />
    </div>
</template>
