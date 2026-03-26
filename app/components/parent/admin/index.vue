<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Parents Management" subtitle="Manage all parents">
            <ParentAdd />
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