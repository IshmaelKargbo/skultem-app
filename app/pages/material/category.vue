<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Categroies | Materials | Skultem'
})
</script>

<template>
    <div class="md:px-5 py-2 md:py-4 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <Heading class="hidden md:flex" title="Material Category"
            subtitle="Organize and manage school material categories">
            <div>
                <MaterialCategoryAdd />
            </div>
        </Heading>
        <MaterialCategoryTable />
    </div>
</template>
