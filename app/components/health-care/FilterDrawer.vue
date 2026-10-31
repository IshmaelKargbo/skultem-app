<script setup lang="ts">
// Same look and behaviour as the Classes page filter (ClassFilterDrawer): picks are drafted in the drawer and only
// applied with Apply; the button's badge counts the filters that differ from the defaults.
const props = defineProps<{
  defaults: HealthCareVisitFilters
  complaintOptions: { label: string, value: string }[]
}>()

const filters = defineModel<HealthCareVisitFilters>({ required: true })

const today = schoolToday()
const open = ref(false)
const draft = ref<HealthCareVisitFilters>({ ...filters.value })

watch(open, (isOpen) => {
  if (isOpen) draft.value = { ...filters.value }
})

/** How many filters differ from the defaults; the date range counts as one. */
function countActive(f: HealthCareVisitFilters) {
  const d = props.defaults
  return [
    f.status !== d.status,
    (f.outcome || '') !== d.outcome,
    (f.complaint || '') !== d.complaint,
    f.overLimit !== d.overLimit,
    f.from !== d.from || f.to !== d.to
  ].filter(Boolean).length
}
const activeCount = computed(() => countActive(filters.value))
const draftIsDefault = computed(() => countActive(draft.value) === 0)
const rangeError = computed(() => draft.value.from && draft.value.to && draft.value.to < draft.value.from
  ? 'The end date must be on or after the start date' : '')

function clearDraft() {
  draft.value = { ...props.defaults }
}

function apply() {
  if (rangeError.value) return
  // A cleared dropdown gives null/undefined; '' is "all", which is what the defaults and the badge compare with.
  filters.value = { ...draft.value, outcome: draft.value.outcome || '', complaint: draft.value.complaint || '' }
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter visits"
    description="Narrow the list by status, outcome, complaint or dates">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="() => { open = false }" />
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="flex flex-col gap-4 md:flex-row">
          <UFormField label="Status" class="md:flex-1">
            <USelectMenu v-model="draft.status" value-key="value" label-key="label" :items="visitFilterOptions"
              :search-input="false" class="w-full" />
          </UFormField>
          <UFormField label="Outcome" class="md:flex-1">
            <USelectMenu :model-value="draft.outcome || undefined" value-key="value" label-key="label"
              :items="outcomeOptions" placeholder="All Outcomes" :search-input="false" clear class="w-full"
              @update:model-value="(v?: HealthCareOutcome | null) => { draft.outcome = v ?? '' }" />
          </UFormField>
          <UFormField label="Complaint" class="md:flex-1">
            <USelectMenu v-model="draft.complaint" value-key="value" label-key="label" :items="props.complaintOptions"
              placeholder="All Complaints" clear class="w-full" />
          </UFormField>
        </div>
        <div class="flex flex-col gap-4 md:flex-row md:items-end">
          <UFormField label="From" class="md:flex-1">
            <UInput v-model="draft.from" type="date" :max="draft.to || today" class="w-full" />
          </UFormField>
          <UFormField label="To" class="md:flex-1">
            <UInput v-model="draft.to" type="date" :min="draft.from" :max="today" class="w-full" />
          </UFormField>
          <div class="md:flex-1 md:pb-2">
            <USwitch v-model="draft.overLimit" label="Over a limit only" />
          </div>
        </div>
        <p v-if="rangeError" class="text-sm text-error">{{ rangeError }}</p>
      </div>
    </template>

    <template #footer>
      <div class="grid w-full grid-cols-2 gap-2 border-t border-default pt-3 md:flex md:justify-end">
        <UButton :icon="DELETE_ICON" class="justify-center md:min-w-32" variant="outline" color="error" label="Clear"
          :disabled="draftIsDefault" @click="clearDraft" />
        <UButton color="primary" label="Apply" class="justify-center md:min-w-32" :disabled="!!rangeError" @click="apply" />
      </div>
    </template>
  </UDrawer>
</template>
