<script setup lang="ts">
const props = defineProps<{
  sortOptions: { label: string; value: string }[]
  activeCount: number
  defaultSort: string
}>()

const sort = defineModel<string>('sort', { required: true })

const open = ref(false)
const draftSort = ref(sort.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftSort.value = sort.value
})

const draftIsDefault = computed(() => draftSort.value === props.defaultSort)

function clearDraft() {
  draftSort.value = props.defaultSort
}

function apply() {
  sort.value = draftSort.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter parents" description="Change the sort order">
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
      <div class="flex flex-col gap-4 md:flex-row">
        <UFormField label="Sort by" class="md:flex-1">
          <USelectMenu v-model="draftSort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by"
            class="w-full" />
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
