<script setup lang="ts">
const store = useAttendanceStore()
const { records, meta } = storeToRefs(store)
const route = useRoute()
const router = useRouter()
const selected = ref<AttendanceHistory | null>()

const clazz = computed<string>({
  get: () => route.query.class as string,
  set: (val) => updateQuery({ page: val })
})

const date = computed<string>({
  get: () => route.query.date as string,
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.date === route.query.date &&
    merged.class === route.query.class
  ) {
    return
  }

  router.replace({ query: merged })
}

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')
async function click(row: AttendanceHistory) {
  await router.push({
    path: '/attendance',
    query: { date: row.date, class: row.classId }
  })

  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
}

watch(() => records.value, () => {
  const select = records.value.find(e => (e.classId == clazz.value && e.date == date.value))
  if (select) {
    selected.value = select
  }
}, { immediate: true })
</script>

<template>
  <UCard>
    <div class="space-y-2">
      <div class="flex">
        <p class="text-lg font-normal">Recent Attendance History ({{ meta.total }})</p>
      </div>
      <div v-for="(item, index) in records" :key="index"
        :class="['flex p-3 justify-between cursor-pointer', index + 1 < records.length ? 'border-b border-gray-200' : '', selected?.classId == item.classId && selected.date == item.date ? 'bg-success-50/40 border-success-200 border rounded-md' : '']"
        @click="click(item)">
        <div class="space-y-0.5">
          <p class="text-base">{{ formatDateString(item.date) }}</p>
          <p class="text-sm text-mute">{{ item.className }}</p>
        </div>
        <div class="flex flex-col items-end">
          <p class="text-2xl text-success-500">{{ (item.presentCount / item.totalCount * 100).toFixed(2) }}%</p>
          <p class="text-xs text-mute">{{ item.presentCount }}/{{ item.totalCount }} present</p>
        </div>
      </div>
    </div>
  </UCard>
</template>