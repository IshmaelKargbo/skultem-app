<script setup lang="ts">
defineProps<{
  termOptions: { label: string; value: string }[]
  classOptions: { label: string; value: string }[]
  sectionOptions: { label: string; value: string }[]
  streamOptions: { label: string; value: string }[]
  activeCount: number
}>()

const termId = defineModel<string>('termId', { required: true })
const classId = defineModel<string>('classId', { required: true })
const level = defineModel<string>('level', { required: true })
const sectionId = defineModel<string>('sectionId', { required: true })
const streamId = defineModel<string>('streamId', { required: true })

// Only the levels this school offers (Settings > School Structure).
const { levelOptions, load: loadStructure } = useScopedLevelOptions()
onMounted(() => loadStructure())

const open = ref(false)
const draftTermId = ref(termId.value)
const draftClassId = ref(classId.value)
const draftLevel = ref(level.value)
const draftSectionId = ref(sectionId.value)
const draftStreamId = ref(streamId.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftTermId.value = termId.value
  draftClassId.value = classId.value
  draftLevel.value = level.value
  draftSectionId.value = sectionId.value
  draftStreamId.value = streamId.value
})

const draftIsDefault = computed(() =>
  !draftTermId.value && !draftClassId.value && !draftLevel.value && !draftSectionId.value && !draftStreamId.value)

function clearDraft() {
  draftTermId.value = ''
  draftClassId.value = ''
  draftLevel.value = ''
  draftSectionId.value = ''
  draftStreamId.value = ''
}

function apply() {
  termId.value = draftTermId.value
  classId.value = draftClassId.value
  level.value = draftLevel.value
  sectionId.value = draftSectionId.value
  streamId.value = draftStreamId.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter report cards"
    description="Narrow the list by term, class, level, section or stream">
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
        <UFormField label="Term">
          <USelectMenu v-model="draftTermId" value-key="value" label-key="label" :items="termOptions"
            placeholder="All Terms" clear class="w-full" />
        </UFormField>
        <UFormField label="Class">
          <USelectMenu v-model="draftClassId" value-key="value" label-key="label" :items="classOptions"
            placeholder="All Classes" clear class="w-full" />
        </UFormField>
        <UFormField label="Level">
          <USelectMenu v-model="draftLevel" value-key="value" label-key="label" :items="levelOptions"
            placeholder="All Levels" clear class="w-full" />
        </UFormField>
        <UFormField label="Section">
          <USelectMenu v-model="draftSectionId" value-key="value" label-key="label" :items="sectionOptions"
            placeholder="All Sections" clear class="w-full" />
        </UFormField>
        <UFormField label="Stream">
          <USelectMenu v-model="draftStreamId" value-key="value" label-key="label" :items="streamOptions"
            placeholder="All Streams" clear class="w-full" />
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
