<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-clock-3" class="size-5 text-primary" />
          <div>
            <h3 class="font-semibold">School Timing</h3>
            <p class="text-xs text-muted">
              Set the overall school schedule
            </p>
          </div>
        </div>
        <div v-if="!loading">
          <UButton v-if="state != 'created'" size="sm" :loading="isLoading" label="Save" @click="save"
            :trailing-icon="SAVE_ICON" />
          <UButton v-if="state == 'created'" size="sm" @click="state = 'edit'" label="Edit" variant="subtle" color="warning"
            :trailing-icon="EDIT_ICON" />
        </div>
      </div>
    </template>

    <div class="grid gap-6">
      <UFormField label="School Starts">
        <USkeleton v-if="loading" class="w-full h-8 bg-gray-200" />
        <UInput v-else :disabled="state == 'created'" v-model="settings.startTime" type="time" class="w-full" />
      </UFormField>
      <UFormField label="School Ends">
        <USkeleton v-if="loading" class="w-full h-8 bg-gray-200" />
        <UInput v-else :disabled="state == 'created'" v-model="settings.endTime" type="time" class="w-full" />
      </UFormField>
      <UFormField label="Period Duration (mins)">
        <USkeleton v-if="loading" class="w-full h-8 bg-gray-200" />
        <UInputNumber v-else :disabled="state == 'created'" v-model="settings.periodDuration" class="w-full" />
      </UFormField>
      <UFormField label="Break Duration (mins)">
        <USkeleton v-if="loading" class="w-full h-8 bg-gray-200" />
        <UInputNumber v-else :disabled="state == 'created'" v-model="settings.breakDuration" class="w-full" />
      </UFormField>
      <UFormField label="Lunch Duration (mins)">
        <USkeleton v-if="loading" class="w-full h-8 bg-gray-200" />
        <UInputNumber v-else :disabled="state == 'created'" v-model="settings.lunchDuration" class="w-full" />
      </UFormField>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { timing: settings } = storeToRefs(store)

const loading = ref(true)
const isLoading = ref(false);
const state = ref<'init' | 'created' | 'edit'>(settings.value.id ? 'created' : 'init')

async function save() {
  try {
    isLoading.value = true
    await store.setTiming({ ...settings.value })
    state.value = 'created'
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    isLoading.value = false
  }
}

watch(() => settings.value, (val) => {
  if (val.id) state.value = 'created'
}, { immediate: true })

onMounted(async () => {
  loading.value = true
  await store.getTiming()
  loading.value = false
})
</script>