<script setup lang="ts">
// Same design as ClassFilterDrawer (Classes page), plus a Class field: edits are drafted in the
// drawer and only applied on "Apply". An empty value means "all" for every field.
const props = defineProps<{
  classes: Clazz[]
  sectionOptions: { label: string; value: string }[]
  streamOptions: { label: string; value: string }[]
  activeCount: number
}>()

const level = defineModel<string>('level', { required: true })
const classId = defineModel<string>('classId', { required: true })
const sectionId = defineModel<string>('sectionId', { required: true })
const streamId = defineModel<string>('streamId', { required: true })

// Only the levels this school offers (Settings > School Structure).
const { levelOptions, load: loadStructure } = useScopedLevelOptions()
onMounted(() => loadStructure())

const open = ref(false)
const draftLevel = ref(level.value)
const draftClassId = ref(classId.value)
const draftSectionId = ref(sectionId.value)
const draftStreamId = ref(streamId.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftLevel.value = level.value
  draftClassId.value = classId.value
  draftSectionId.value = sectionId.value
  draftStreamId.value = streamId.value
})

// Classes narrow to the chosen level; a class from another level no longer fits, so drop it.
const classOptions = computed(() => props.classes
  .filter(c => !draftLevel.value || c.level === draftLevel.value)
  .map(c => ({ label: c.name, value: c.id })))
watch(draftLevel, () => {
  if (draftClassId.value && !classOptions.value.some(c => c.value === draftClassId.value)) draftClassId.value = ''
})

const draftIsDefault = computed(() =>
  !draftLevel.value && !draftClassId.value && !draftSectionId.value && !draftStreamId.value)

function clearDraft() {
  draftLevel.value = ''
  draftClassId.value = ''
  draftSectionId.value = ''
  draftStreamId.value = ''
}

function close() {
  open.value = false
}

function apply() {
  level.value = draftLevel.value
  classId.value = draftClassId.value
  sectionId.value = draftSectionId.value
  streamId.value = draftStreamId.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter attendance"
    description="Narrow the report by level, class, section or stream">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="close" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 md:flex-row">
        <UFormField label="Level" class="md:flex-1">
          <USelectMenu v-model="draftLevel" value-key="value" label-key="label" :items="levelOptions"
            placeholder="All Levels" clear class="w-full" />
        </UFormField>
        <UFormField label="Class" class="md:flex-1">
          <USelectMenu v-model="draftClassId" value-key="value" label-key="label" :items="classOptions"
            placeholder="All Classes" clear class="w-full" />
        </UFormField>
        <UFormField label="Section" class="md:flex-1">
          <USelectMenu v-model="draftSectionId" value-key="value" label-key="label" :items="sectionOptions"
            placeholder="All Sections" clear class="w-full" />
        </UFormField>
        <UFormField label="Stream" class="md:flex-1">
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
