<template>
    <div class="p-4 space-y-4">
        <LedgerReport />
        <LedgerTable />
        <LedgerTableMobile />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Student Ledger')
    document.title = 'Ledger | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
