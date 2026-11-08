<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="txn-tabs"><TransactionSectionNav /></div>
        <GuideBar topic="admin-platform-fee" />
        <div data-guide="pf-summary"><TransactionPlatformReport /></div>
        <div data-guide="pf-list"><TransactionPlatformTable /></div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Platform Fee')
    document.title = 'Platform Fee | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
