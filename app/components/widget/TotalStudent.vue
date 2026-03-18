<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Total Students</p>

      <div v-if="!isReady" class="animate-pulse space-y-2">
        <div class="h-7 w-24 bg-gray-200 rounded" />
        <div class="h-4 w-32 bg-gray-200 rounded" />
      </div>

      <template v-else>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-semibold">{{ totalStudents }}</p>
          <UBadge :icon="STUDENT_ICON" variant="subtle" size="xl" class="p-1.5" color="info" />
        </div>
        <div class="text-xs text-muted">
          <p>Total enrolled students</p>
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()

const isReady      = ref(false)
const totalStudents = ref("0")

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "students",
    title: "Total Students",
    filters: [],
    metrics: [
      {
        name: "Total Students",
        aggregation: "count",
        field: "id"
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    // Shape: [{ "Total Students": 920 }]
    const row = widget[0]
    totalStudents.value = Number(row?.["Total Students"] ?? 0).toLocaleString()
  } else if (widget.datasets) {
    // Shape: { datasets: [{ label: "Total Students", data: [920] }] }
    const dataset = widget.datasets.find((d: any) => d.label === "Total Students")
    totalStudents.value = Number(dataset?.data?.[0] ?? 0).toLocaleString()
  } else {
    // Shape: flat object { "Total Students": 920 }
    totalStudents.value = Number(widget["Total Students"] ?? 0).toLocaleString()
  }

  isReady.value = true
})
</script>