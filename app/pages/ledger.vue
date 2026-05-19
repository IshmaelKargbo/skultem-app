<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <LedgerReport />
        <UCard>
            <div class="flex space-x-2">
                <UInput type="date" />
                <UInput type="date" />
                <USelectMenu placeholder="Select Type" />
                <USelectMenu placeholder="Select Class" />
                <USelectMenu placeholder="Select Term" />
            </div>
        </UCard>
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
