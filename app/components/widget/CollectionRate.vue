<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Fee Collection Rate</p>

      <div v-if="!isReady" class="animate-pulse space-y-2">
        <div class="h-7 w-32 bg-gray-200 rounded" />
        <div class="h-4 w-24 bg-gray-200 rounded" />
      </div>

      <template v-else>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-semibold">{{ totalOutstanding }}</p>
          <UBadge :icon="FEE_STRUCTURE_ICON" variant="subtle" size="xl" class="p-1.5" color="error" />
        </div>
        <div class="text-xs text-muted">
          <p>Percentage of total fees collected</p>
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()
const isReady = ref(false)
const totalOutstanding = ref("0")

onMounted(async () => {
  const amountRes = await store.runAnalytic({
    entity: "fees",
    title: "Colloction Rate",
    filters: [],
    metrics: [
      {
        name: "Paid Amount",
        aggregation: "sum",
        field: "amountPaid",
        tags: { field: "status", value: "Paid" }
      },
      {
        name: "Partial Paid",
        aggregation: "sum",
        field: "amountPaid",
        tags: { field: "status", value: "Partial" }
      },
      {
        name: "Total Amount",
        aggregation: "sum",
        field: "amount"
      }
    ],
    chartType: "stat"
  })

  // Outstanding amount
  const amountWidget = amountRes?.data ?? amountRes
  if (amountWidget?.datasets) {
    const paid = Number(amountWidget.datasets.find((d: any) => d.label === "Paid Amount")?.data?.[0] ?? 0)
    const partialPaid = Number(amountWidget.datasets.find((d: any) => d.label === "Partial Paid")?.data?.[0] ?? 0)
    const totalPaid = paid + partialPaid
    const total = Number(amountWidget.datasets.find((d: any) => d.label === "Total Amount")?.data?.[0] ?? 0)
    const rate = totalPaid / total * 100
    totalOutstanding.value = `${Math.min(rate, 100).toFixed(1)}%`
  }

  isReady.value = true
})
</script>