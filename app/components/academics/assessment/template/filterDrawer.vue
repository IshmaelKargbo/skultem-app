<script setup lang="ts">
defineProps<{ activeCount: number }>()

const status = defineModel<string>('status', { required: true })
const scoring = defineModel<string>('scoring', { required: true })

const statusOptions = [
  { label: 'Balanced', value: 'Balanced' },
  { label: 'Incomplete', value: 'Incomplete' },
  { label: 'Overweighted', value: 'Overweighted' }
]
const scoringOptions = [
  { label: 'Simple scores', value: 'SIMPLE' },
  { label: 'Continuous assessment (CA)', value: 'CA' },
  { label: 'CA with the attendance register', value: 'ATTENDANCE' }
]

const open = ref(false)
const draftStatus = ref(status.value)
const draftScoring = ref(scoring.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftStatus.value = status.value
  draftScoring.value = scoring.value
})

const draftIsDefault = computed(() => !draftStatus.value && !draftScoring.value)
function clearDraft() {
  draftStatus.value = ''
  draftScoring.value = ''
}
function apply() {
  status.value = draftStatus.value
  scoring.value = draftScoring.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter templates"
    description="Narrow the list by weight status or how tests are scored">
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
        <UFormField label="Weight status" class="md:flex-1"
          help="Balanced means the tests share exactly 100% of the term mark.">
          <USelectMenu v-model="draftStatus" value-key="value" label-key="label" :items="statusOptions"
            placeholder="All statuses" clear class="w-full" />
        </UFormField>
        <UFormField label="Scoring" class="md:flex-1">
          <USelectMenu v-model="draftScoring" value-key="value" label-key="label" :items="scoringOptions"
            placeholder="All scoring types" clear class="w-full" />
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
