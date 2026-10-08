<script setup lang="ts">
const store = useAttendanceStore()
const { records, meta, loading } = storeToRefs(store)

const PAGE_SIZE = 7
const route = useRoute()
const router = useRouter()

// `class` in the URL is the class session (SSS 1 Art), so a row is the open one when its session and date match.
const selected = computed(() => {
  return records.value.find(e => e.sessionId === clazz.value && e.date === date.value)
})

// Driven by the store so marking attendance (which reloads page 1) and paging stay in step.
const page = computed<number>({
  get: () => Number(meta.value.page ?? 1),
  set: (val) => { if (clazz.value) store.fetchAll(clazz.value, val, PAGE_SIZE) }
})

// "A" / "A · Art" - what tells SSS 1 Art apart from SSS 1 Science in the history.
function sectionLabel(item: AttendanceHistory) {
  return [item.sectionName, item.streamName && item.streamName !== 'N/A' ? item.streamName : '']
    .filter(Boolean)
    .join(' · ')
}

const clazz = computed<string>({
  get: () => route.query.class as string,
  set: (val) => updateQuery({ class: val })
})

const date = computed<string>({
  get: () => route.query.date as string,
  set: (val) => updateQuery({ date: val })
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

async function click(row: AttendanceHistory) {
  updateQuery({
    date: row.date,
    class: row.sessionId
  })
}
</script>

<template>
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <div>
      <div v-if="records.length > 0" v-for="(item, index) in records" :key="index" :class="[
        'flex p-3 justify-between cursor-pointer transition-colors',
        index + 1 < records.length ? 'border-b border-gray-200 dark:border-gray-800' : '',
        selected?.sessionId == item.sessionId && selected.date == item.date
          ? 'bg-success-50/40 dark:bg-gray-950 rounded-md'
          : 'hover:bg-gray-50  dark:border-gray-800 dark:hover:bg-gray-950'
      ]" @click="click(item)">
        <div class="space-y-0.5">
          <p class="md:text-base font-medium">{{ formatDateString(item.date) }}</p>
          <p class="text-sm text-mute">{{ item.className }}<span v-if="sectionLabel(item)"> · {{ sectionLabel(item) }}</span></p>
        </div>
        <div class="flex flex-col items-end">
          <p class="md:text-2xl text-xl text-success-500">{{ (item.presentCount / item.totalCount * 100).toFixed(0) }}%
          </p>
          <div class="flex space-x-2">
            <p class="text-xs text-mute">{{ item.presentCount }}/{{ item.totalCount }} present</p>
            <p class="text-xs text-info">| {{ formatDateTime(item.createdAt) }}</p>
          </div>
        </div>
      </div>
      <div v-else
        class="flex flex-col m-4 items-center justify-center rounded-xl border-2 border-dashed dark:border-gray-700 border-gray-200 py-10">
        <UIcon name="i-lucide-calendar-x" class="mb-2 text-4xl text-muted" />

        <p class="font-medium">
          No attendance records
        </p>

        <p class="text-sm text-muted">
          Attendance records will appear here.
        </p>
      </div>
    </div>

    <template v-if="meta.total > PAGE_SIZE" #footer>
      <div class="flex items-center justify-between">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :page-size="PAGE_SIZE" :items-per-page="PAGE_SIZE"
          :total="meta.total" :disabled="loading" />
      </div>
    </template>
  </UCard>
</template>