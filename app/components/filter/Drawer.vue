<script setup lang="ts">
// The bottom filter drawer shared by the Transactions and Fees & Payment pages - the same drawer as the class list
// (see class/FilterDrawer.vue): a button with an active-count badge, draft values, Clear and Apply. Each page
// describes its own filters through `fields`; the values live in a plain { key: value } object.
export type FilterField = {
  key: string
  label: string
  type: 'select' | 'date' | 'number' | 'student'
  options?: { label: string, value: string }[]
  placeholder?: string
  // What "not filtered" is for this field - '' for most, 'desc' for the sort order.
  default?: string
  // Not clearable: a choice that always has a value (the sort order).
  required?: boolean
}

const props = defineProps<{
  fields: FilterField[]
  title?: string
  description?: string
}>()

// Only the student field needs the async student lookup.
const { searchTerm: studentSearchTerm, students: studentOptions, loading: studentsLoading } = useStudentSearch()

const model = defineModel<Record<string, string>>({ required: true })

const defaultOf = (f: FilterField) => f.default ?? ''

const activeCount = computed(() => props.fields.filter(f => (model.value[f.key] ?? defaultOf(f)) !== defaultOf(f)).length)

const open = ref(false)
const draft = ref<Record<string, string>>({ ...model.value })

watch(open, (isOpen) => {
  if (isOpen) draft.value = { ...model.value }
})

const draftIsDefault = computed(() =>
  props.fields.every(f => (draft.value[f.key] ?? defaultOf(f)) === defaultOf(f)))

function clearDraft() {
  draft.value = Object.fromEntries(props.fields.map(f => [f.key, defaultOf(f)]))
}

function apply() {
  model.value = { ...model.value, ...draft.value }
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" :title="title ?? 'Filters'"
    :description="description ?? 'Narrow the list'">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="grid gap-4 md:grid-cols-3">
        <UFormField v-for="f in fields" :key="f.key" :label="f.label">
          <USelectMenu v-if="f.type === 'select'" v-model="draft[f.key]" value-key="value" label-key="label"
            :items="f.options ?? []" :placeholder="f.placeholder" :clear="!f.required" class="w-full" />
          <USelectMenu v-else-if="f.type === 'student'" v-model="draft[f.key]"
            v-model:search-term="studentSearchTerm" :items="studentOptions" :loading="studentsLoading" ignore-filter
            value-key="value" label-key="label" :placeholder="f.placeholder ?? 'Every student'" clear class="w-full" />
          <UInput v-else-if="f.type === 'number'" v-model="draft[f.key]" type="number" :placeholder="f.placeholder"
            class="w-full" />
          <UInput v-else v-model="draft[f.key]" type="date" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="grid grid-cols-2 gap-2 w-full md:flex md:justify-end border-t pt-3 border-default">
        <UButton :icon="DELETE_ICON" class="justify-center md:min-w-32" variant="outline" color="error" label="Clear"
          :disabled="draftIsDefault" @click="clearDraft" />
        <UButton color="primary" label="Apply" class="justify-center md:min-w-32" @click="apply" />
      </div>
    </template>
  </UDrawer>
</template>
