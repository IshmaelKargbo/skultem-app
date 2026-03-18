<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Attendance Rate</p>

      <div v-if="!isReady" class="animate-pulse space-y-2">
        <div class="h-7 w-24 bg-gray-200 rounded" />
        <div class="h-4 w-28 bg-gray-200 rounded" />
      </div>

      <template v-else>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-semibold">{{ attendanceRate }}%</p>
          <UBadge :icon="ATTENDANCE_ICON" variant="subtle" size="xl" class="p-1.5" color="success" />
        </div>
        <div class="text-xs text-muted">
          <p>Based on all attendance records</p>
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()

const isReady        = ref(false)
const attendanceRate = ref("0.0")

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "attendances",
    title: "Attendance Rate",
    filters: [],
    metrics: [
      {
        name: "Present",
        aggregation: "percentage",
        field: "state",
        tags: { field: "state", value: "Present" }
      },
      {
        name: "Late",
        aggregation: "percentage",
        field: "state",
        tags: { field: "state", value: "Late" }
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res
  if (!widget?.datasets) return

  const present = Number(widget.datasets[0]?.data?.[0] ?? 0)
  const late    = Number(widget.datasets[1]?.data?.[0] ?? 0)

  attendanceRate.value = Math.min(present + late, 100).toFixed(1)

  isReady.value = true
})
</script>