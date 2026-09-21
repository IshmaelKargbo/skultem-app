<script setup lang="ts">
defineProps<{
  sectionOptions: { label: string; value: string }[]
  streamOptions: { label: string; value: string }[]
  activeCount: number
}>()

const sectionId = defineModel<string>('sectionId', { required: true })
const streamId = defineModel<string>('streamId', { required: true })
const level = defineModel<string>('level', { required: true })

const levelOptions = Object.entries(parseLevel).map(([value, label]) => ({ label, value }))

const open = ref(false)
const draftSectionId = ref(sectionId.value)
const draftStreamId = ref(streamId.value)
const draftLevel = ref(level.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftSectionId.value = sectionId.value
  draftStreamId.value = streamId.value
  draftLevel.value = level.value
})

const draftIsDefault = computed(() => !draftLevel.value && !draftSectionId.value && !draftStreamId.value)

function clearDraft() {
  draftSectionId.value = ''
  draftStreamId.value = ''
  draftLevel.value = ''
}

function apply() {
  sectionId.value = draftSectionId.value
  streamId.value = draftStreamId.value
  level.value = draftLevel.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter classes" description="Narrow the list by level, section or stream">
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
        <UFormField label="Level" class="md:flex-1">
          <USelectMenu v-model="draftLevel" value-key="value" label-key="label" :items="levelOptions"
            placeholder="All Levels" clear class="w-full" />
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
