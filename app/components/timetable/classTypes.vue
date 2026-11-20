<!-- Which timetable each class runs on: the normal timetable (periods each day, a lesson in each) or the weekly plan
     (the term week by week, a subject in each session - e.g. nursery). A class has one, never both; every section of
     the class uses it, year after year. Switching keeps the other one's lessons, just hidden. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-calendar-cog" class="size-4" /></span>
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-highlighted">Timetable for each class</h3>
            <p class="text-xs text-muted">Every section of a class follows the same one, year after year</p>
          </div>
        </div>
        <UInput v-if="(types?.length ?? 0) > 8" v-model="search" icon="i-lucide-search" placeholder="Find a class"
          class="w-full sm:w-56" />
      </div>
    </template>

    <div v-if="loading && !types" class="space-y-2">
      <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-xl" />
    </div>
    <p v-else-if="!types?.length" class="py-6 text-center text-sm text-muted">No classes yet.</p>
    <ul v-else class="divide-y divide-default">
      <li v-for="c in shown" :key="c.classId" class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="truncate font-medium text-highlighted">{{ c.className }}</p>
          <p class="text-xs text-muted">{{ note(c) }}</p>
        </div>
        <div class="inline-flex shrink-0 rounded-xl bg-elevated/70 p-0.5" role="radiogroup" :aria-label="`Timetable for ${c.className}`">
          <button v-for="o in OPTIONS" :key="o.value" type="button" role="radio" :aria-checked="c.type === o.value"
            :disabled="saving === c.classId"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
            :class="c.type === o.value ? 'bg-default text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
            @click="choose(c, o.value)">
            <UIcon :name="o.icon" class="size-3.5" />{{ o.label }}
          </button>
        </div>
      </li>
    </ul>

    <UModal v-model:open="confirmOpen" :title="pending ? `Switch ${pending.c.className}?` : ''">
      <template #body>
        <p v-if="pending" class="text-sm text-muted">
          {{ pending.c.className }} has a {{ pending.to === 'WEEKLY_PLAN' ? 'normal timetable with lessons' : 'weekly plan' }}.
          After the switch it is hidden from staff, teachers and parents, and
          {{ pending.to === 'WEEKLY_PLAN' ? 'the class is planned week by week instead' : 'the class follows the normal timetable instead' }}.
          Nothing is deleted - switch back to see it again.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="outline" @click="() => { confirmOpen = false }" />
          <UButton label="Switch" :loading="!!saving" @click="() => { if (pending) save(pending.c, pending.to) }" />
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
const OPTIONS: { value: ClassTimetableKind, label: string, icon: string }[] = [
  { value: 'PERIODS', label: 'Normal timetable', icon: 'i-lucide-calendar-days' },
  { value: 'WEEKLY_PLAN', label: 'Weekly plan', icon: 'i-lucide-calendar-range' },
]

const { types, loading, load, set } = useClassTimetableTypes()
const search = ref('')
const saving = ref<string | null>(null)
const confirmOpen = ref(false)
const pending = ref<{ c: ClassTimetableType, to: ClassTimetableKind } | null>(null)

const shown = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (types.value ?? []).filter((c) => !q || c.className.toLowerCase().includes(q))
})

function note(c: ClassTimetableType) {
  if (c.type === 'WEEKLY_PLAN') return c.hasTimetable ? 'Planned week by week · its old normal timetable is hidden' : 'Planned week by week'
  return c.hasWeeklyPlan ? 'Periods each day · its old weekly plan is hidden' : 'Periods each day'
}

// Switching a class away from a timetable that has something in it asks first; an empty one switches straight away.
function choose(c: ClassTimetableType, to: ClassTimetableKind) {
  if (c.type === to) return
  const losesSomething = to === 'WEEKLY_PLAN' ? c.hasTimetable : c.hasWeeklyPlan
  if (losesSomething) {
    pending.value = { c, to }
    confirmOpen.value = true
    return
  }
  save(c, to)
}

async function save(c: ClassTimetableType, to: ClassTimetableKind) {
  saving.value = c.classId
  try {
    await set(c.classId, to)
    useNotify().success(`${c.className} now uses the ${to === 'WEEKLY_PLAN' ? 'weekly plan' : 'normal timetable'}`)
    confirmOpen.value = false
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    saving.value = null
  }
}

onMounted(() => { load(true).catch((e) => useNotify().error(e)) })
</script>
