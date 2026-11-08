<template>
    <div class="px-4 md:px-6 space-y-3">
        <TransactionSectionNav />
        <GuideBar topic="finance-ledger" />
        <div data-guide="fin-ledger-summary"><LedgerReport /></div>
        <div data-guide="fin-ledger-list"><LedgerTable /></div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Student Ledger')
    document.title = 'Ledger | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
