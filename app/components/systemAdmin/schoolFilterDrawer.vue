<script setup lang="ts">
// Same drawer as the classes list (components/class/FilterDrawer.vue): edit a draft, apply to commit it.
defineProps<{
  activeCount: number
}>()

const status = defineModel<string>('status', { required: true })
const type = defineModel<string>('type', { required: true })

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Deleted', value: 'DELETED' }
]
const typeOptions = [
  { label: 'Live', value: 'LIVE' },
  { label: 'Playground', value: 'PLAYGROUND' }
]

const open = ref(false)
const draftStatus = ref(status.value)
const draftType = ref(type.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftStatus.value = status.value
  draftType.value = type.value
})

const draftIsDefault = computed(() => !draftStatus.value && !draftType.value)

function clearDraft() {
  draftStatus.value = ''
  draftType.value = ''
}

function apply() {
  status.value = draftStatus.value
  type.value = draftType.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter schools" description="Narrow the list by status or by live and playground">
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
        <UFormField label="Status" class="md:flex-1">
          <USelectMenu v-model="draftStatus" value-key="value" label-key="label" :items="statusOptions"
            placeholder="All Statuses" clear class="w-full" />
        </UFormField>
        <UFormField label="Type" class="md:flex-1">
          <USelectMenu v-model="draftType" value-key="value" label-key="label" :items="typeOptions"
            placeholder="Live and Playground" clear class="w-full" />
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
