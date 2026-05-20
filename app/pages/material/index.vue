<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Materials | Skultem'
})
</script>

<template>
    <div class="md:px-5 py-2 md:py-4 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <Heading class="hidden md:flex" title="Materials" subtitle="Manage and track school materials">
            <div class="flex space-x-3">
                <MaterialAdd />
                <MaterialRestock />
            </div>
        </Heading>
        <MaterialTable />
    </div>
</template>
