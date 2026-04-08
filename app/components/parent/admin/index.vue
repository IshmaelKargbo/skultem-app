<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Parents Management" subtitle="Manage all parents">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name" />
                <ParentAdd />
            </div>
        </Heading>
        <ParentTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Parents');

    document.title = 'Parents | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT]
})
</script>