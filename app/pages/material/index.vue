<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Materials | Skultem'
})
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading class="hidden md:flex" title="Materials" subtitle="Manage and track school materials">
            <div class="flex space-x-3">
                <MaterialAdd />
                <MaterialRestock />
            </div>
        </Heading>
        <MaterialTable />
    </div>
</template>
