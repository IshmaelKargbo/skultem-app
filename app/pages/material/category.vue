<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Categroies | Materials | Skultem'
})
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading class="hidden md:flex" title="Material Category"
            subtitle="Organize and manage school material categories">
            <div>
                <MaterialCategoryAdd />
            </div>
        </Heading>
        <MaterialCategoryTable />
    </div>
</template>
