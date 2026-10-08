<script setup lang="ts">
// A filter strip for report pages with no search box: the active filters as chips on the left, the class-style
// filter drawer on the right. Same { key: value } model and fields as FilterDrawer.
import type { FilterField } from './Drawer.vue'

const props = defineProps<{
  fields: FilterField[]
  title?: string
  description?: string
}>()

// A reactive object (a page's own `filters`) is edited in place; a ref gets a fresh object.
const model = defineModel<Record<string, string>>({ required: true })

const defaultOf = (f: FilterField) => f.default ?? ''

const chips = computed(() => props.fields
  .filter(f => (model.value[f.key] ?? defaultOf(f)) !== defaultOf(f))
  .map((f) => {
    const value = model.value[f.key] ?? ''
    if (f.type === 'select') {
      return `${f.label}: ${f.options?.find(o => o.value === value)?.label ?? value}`
    }
    return f.type === 'student' ? 'Student selected' : `${f.label}: ${value}`
  }))
</script>

<template>
  <UCard :ui="{ body: 'p-3 sm:p-3' }">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <template v-if="chips.length">
          <UBadge v-for="c in chips" :key="c" color="neutral" variant="subtle" size="sm" :label="c" />
        </template>
        <p v-else class="text-sm text-muted">No filters applied</p>
      </div>
      <FilterDrawer v-model="model" :fields="fields" :title="title" :description="description" />
    </div>
  </UCard>
</template>
