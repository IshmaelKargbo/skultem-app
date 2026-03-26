<template>
  <Metric :record="{
    label: 'Total Students',
    color: 'primary',
    value: value,
    isReady: isReady,
    icon: STUDENT_ICON,
    subtle: 'All students enrolled'
  }" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const store = useWidgetStore()
const { sessionId } = defineProps<{
  sessionId: string | undefined
}>()

const isReady = ref(false)
const value = ref("0")

async function fetchTermAverage() {
  if (sessionId == null) return

  const res = await store.runAnalytic({
    entity: "students",
    title: "Total Students",
    filters: [
      {
        field: "clazz.id",
        value: sessionId,
        operator: "EQUALS",
        type: "select"
      },
    ],
    metrics: [
      {
        name: "Total",
        aggregation: "count"
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res
  const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  value.value = currentAverage.toFixed(0)

  isReady.value = true
}

watch
  (
    () => [sessionId],
    async () => {
      isReady.value = false
      await fetchTermAverage()
    },
    { immediate: true }
  )
</script>