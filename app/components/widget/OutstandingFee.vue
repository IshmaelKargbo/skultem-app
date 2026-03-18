<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Outstanding Fees</p>

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
          <p>From {{ studentCount }} students</p>
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store          = useWidgetStore()
const { format }     = useMoney()
const isReady        = ref(false)
const totalOutstanding = ref("0")
const studentCount   = ref(0)

onMounted(async () => {
  const [amountRes, studentRes] = await Promise.all([
    // Query 1: outstanding amount (total - paid - partialPaid)
    store.runAnalytic({
      entity: "fees",
      title: "Outstanding Fees",
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
    }),

    // Query 2: one row per student — filter those with any outstanding balance
    store.runAnalytic({
      entity: "fees",
      title: "Outstanding Students",
      filters: [],
      metrics: [
        {
          name: "Partial",
          aggregation: "sum",
          field: "amountPaid",
          tags: { field: "status", value: "Partial", groupBy: "id" }
        },
        {
          name: "Pending",
          aggregation: "sum",
          field: "amount",
          tags: { field: "status", value: "Pending", groupBy: "id" }
        }
      ],
      chartType: "table"
    })
  ])

  // Outstanding amount
  const amountWidget = amountRes?.data ?? amountRes
  if (amountWidget?.datasets) {
    const paid        = Number(amountWidget.datasets.find((d: any) => d.label === "Paid Amount")?.data?.[0]  ?? 0)
    const partialPaid = Number(amountWidget.datasets.find((d: any) => d.label === "Partial Paid")?.data?.[0] ?? 0)
    const total       = Number(amountWidget.datasets.find((d: any) => d.label === "Total Amount")?.data?.[0] ?? 0)
    totalOutstanding.value = format(total - paid - partialPaid)
  }

  const studentWidget = studentRes?.data ?? studentRes
  if (Array.isArray(studentWidget)) {
    studentCount.value = studentWidget.filter(
      (row: any) => Number(row.Partial ?? 0) > 0 || Number(row.Pending ?? 0) > 0
    ).length
  }

  isReady.value = true
})
</script>