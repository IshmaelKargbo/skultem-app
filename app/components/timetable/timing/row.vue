<template>
  <UCard>
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UInput v-if="mode !== 'created'" v-model="state.name" placeholder="Template name" class="w-48" />
          <h4 v-else class="font-semibold">{{ record.name }}</h4>
          <UBadge v-if="record.isDefault" color="primary" variant="subtle" size="sm">Default</UBadge>
        </div>

        <div class="flex items-center gap-1">
          <UButton v-if="mode === 'created'" size="sm" variant="ghost" color="warning" :icon="EDIT_ICON"
            @click="mode = 'edit'" />
          <UButton v-else size="sm" :loading="saving" :icon="SAVE_ICON" @click="save">Save</UButton>

          <UButton v-if="mode === 'created' && !record.isDefault" size="sm" variant="ghost"
            icon="i-lucide-star" title="Set as default" @click="setDefault" />

          <UButton v-if="mode === 'created' && !record.isDefault" size="sm" variant="ghost" color="error"
            :icon="DELETE_ICON" @click="confirmDelete = true" />
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <UFormField label="Starts">
          <UInput :disabled="mode === 'created'" v-model="state.startTime" type="time" class="w-full" />
        </UFormField>
        <UFormField label="Ends">
          <UInput :disabled="mode === 'created'" v-model="state.endTime" type="time" class="w-full" />
        </UFormField>
        <UFormField label="Period (mins)">
          <UInputNumber :disabled="mode === 'created'" v-model="state.periodDuration" class="w-full" />
        </UFormField>
        <UFormField label="Break (mins)">
          <UInputNumber :disabled="mode === 'created'" v-model="state.breakDuration" class="w-full" />
        </UFormField>
        <UFormField label="Lunch (mins)">
          <UInputNumber :disabled="mode === 'created'" v-model="state.lunchDuration" class="w-full" />
        </UFormField>
      </div>

      <div v-if="record.levels?.length" class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs text-muted">Used by:</span>
        <UBadge v-for="level in record.levels" :key="level" variant="soft" size="sm">
          {{ schoolLevelLabel(level) }}
        </UBadge>
      </div>
    </div>

    <TimetableTimingDeletePrompt v-model:open="confirmDelete" :timing-id="record.id" :timing-name="record.name" />
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps<{
  record: Timing
  index: number
}>()

const store = useTimetableStore()

const mode = ref<'init' | 'created' | 'edit'>(props.record.id ? 'created' : 'init')
const saving = ref(false)
const confirmDelete = ref(false)

const state = reactive({
  name: props.record.name,
  startTime: props.record.startTime,
  endTime: props.record.endTime,
  periodDuration: props.record.periodDuration,
  breakDuration: props.record.breakDuration,
  lunchDuration: props.record.lunchDuration
})

watch(() => props.record, (record) => {
  state.name = record.name
  state.startTime = record.startTime
  state.endTime = record.endTime
  state.periodDuration = record.periodDuration
  state.breakDuration = record.breakDuration
  state.lunchDuration = record.lunchDuration
  mode.value = record.id ? 'created' : 'init'
}, { deep: true })

async function save() {
  try {
    saving.value = true
    await store.saveTiming({ ...state }, props.record.id || undefined, props.index)
    mode.value = 'created'
  } catch (error: any) {
    useNotify().error(error?.message || error)
  } finally {
    saving.value = false
  }
}

async function setDefault() {
  try {
    await store.setDefaultTiming(props.record.id)
  } catch (error: any) {
    useNotify().error(error?.message || error)
  }
}
</script>
