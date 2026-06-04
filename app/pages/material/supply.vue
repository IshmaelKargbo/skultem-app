<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Categroies | Materials | Skultem'
})
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading class="" title="Supplies" subtitle="Manage and track school supply records">
            <div class="flex space-x-3">
                <UInput placeholder="Search by student name" />
                <MaterialSupplyGive />
            </div>
        </Heading>
        <MaterialSupplyTable />
    </div>
</template>
