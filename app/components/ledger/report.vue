<template>

    <div class="flex space-x-5">
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-1">
                    <p class="text-mute">Total Debit</p>
                    <p class="text-2xl text-red-400" v-if="report">{{ format(report.totalDebit) }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
            </div>
        </UCard>
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-1">
                    <p class="text-mute">Total Credit</p>
                    <p class="text-2xl text-success-400" v-if="report">{{ format(report.totalCredit) }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
            </div>
        </UCard>
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-1">
                    <p class="text-mute">Net Balance</p>
                    <p class="text-2xl text-blue-500" v-if="report">{{ format(report.netBalance) }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const store = useLedgerStore()
const { format } = useMoney()

type LedgerReportDTO = {
    totalDebit: number
    totalCredit: number
    netBalance: number
}

const report = ref<LedgerReportDTO>()

async function fetchRecord() {
    isLoading.value = true
    const res = await store.caculateLedgerReport()
    report.value = res
    isLoading.value = false
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>