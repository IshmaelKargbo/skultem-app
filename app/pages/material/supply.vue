<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Categroies | Materials | Skultem'
})
</script>

<template>
    <div class="md:px-5 py-2 md:py-4 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <Heading class="" title="Supplies" subtitle="Manage and track school supply records">
            <div class="flex space-x-3">
                <UInput placeholder="Search by student name" />
                <MaterialSupplyGive />
            </div>
        </Heading>
        <MaterialSupplyTable />
    </div>
</template>
