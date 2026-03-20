<template>
  <UCard>
    <div>
      <div class="flex items-center justify-between">
        <p class="text-muted">Performance Breakdown</p>
      </div>
      <div class="mt-5">
        <div v-for="item in source" :key="item.subject" class="space-y-2 mb-4">
          <div class="flex justify-between font-semibold">
            <p>{{ item.subject }}</p>
            <p>{{ item.value }}%</p>
          </div>

          <div>
            <UProgress color="neutral" size="md" :max="100" v-model="item.value" />
          </div>
        </div>

        <div v-if="!isReady" class="text-gray-400 text-sm w-full flex items-center justify-center h-56">
          Loading performance...
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const store = useWidgetStore()

const { id, term } = defineProps<{
  id: string
  term: string
}>()

const isReady = ref(false)
const source = ref<any[]>([])

async function fetchAssessments() {
  if (!term) return

  const res = await store.runAnalytic({
    entity: "assessments",
    title: "Term Average",
    filters: [
      {
        field: "studentAssessment.enrollment.student.id",
        value: id,
        operator: "EQUALS",
        type: "select"
      },
      {
        field: "cycle.term.id",
        value: term,
        operator: "EQUALS",
        type: "select"
      }
    ],
    metrics: [
      {
        name: "Average",
        aggregation: "avg",
        field: "score",
        tags: {
          groupBy: "subject"
        }
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res

  source.value = widget.labels.map((subject: string, index: number) => ({
    subject,
    value: Math.round(widget.datasets[0].data[index])
  }))

  isReady.value = true
}

watch(
  () => term,
  () => {
    fetchAssessments()
  },
  { immediate: true }
)
</script>