<script lang="ts" setup>
onMounted(async () => {
    useAppStore().setTitle('All Materials')
    document.title = 'Materials | Skultem'
})

// Missing entirely before - the nav only links here for Admin/Proprietor/Owner (see
// components/menu/index.vue's "Materials & Supplies" group), but with no guard here, any role
// could reach /material directly and use the full materials management UI.
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Materials" subtitle="Manage and track school materials">
            <div class="flex space-x-3">
                <MaterialAdd />
                <MaterialRestock />
            </div>
        </Heading>
        <MaterialTable />
    </div>
</template>
