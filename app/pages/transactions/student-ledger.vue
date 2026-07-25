<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full overflow-y-auto space-y-4 sm:space-y-5">
        <LedgerReport />
        <LedgerTable />
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
