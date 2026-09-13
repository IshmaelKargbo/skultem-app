<template>
  <UCard>
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
          <div>
            <h3 class="font-semibold">Working Days</h3>
            <p class="text-sm text-muted hidden md:block">
              Choose days classes are held, per timing template
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton v-if="mode != 'created'" size="sm" :loading="isLoading" label="Save" @click="save"
            :icon="SAVE_ICON" />
          <UButton v-else size="sm" @click="mode = 'edit'" :icon="EDIT_ICON" label="Edit" color="warning" variant="outline" />
        </div>
      </div>
    </template>

    <div v-if="!templateOptions.length && !timingLoading"
      class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default py-10 text-center">
      <UIcon name="i-lucide-clock-3" class="size-8 text-muted" />
      <p class="text-sm text-muted">Save a timing template first to set its working days</p>
    </div>

    <template v-else>
      <UFormField label="Timing template" class="mb-4">
        <USelectMenu v-model="timingId" value-key="value" :items="templateOptions" :loading="timingLoading"
          class="w-full sm:w-64" />
      </UFormField>

      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 7" :key="i" class="h-14 w-full bg-gray-200" />
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="row in workingDays"
          :key="row.day"
          class="flex items-center justify-between rounded-2xl border border-default px-4 py-3"
          :class="{ 'opacity-50': !row.state }"
        >
          <div class="min-w-0">
            <p class="font-medium">
              {{ clean(row.day) }}
            </p>
          </div>
          <USwitch :disabled="mode == 'created'" v-model="row.state" />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { workingDays, timings, timingLoading } = storeToRefs(store)
const mode = ref<'init' | 'created' | 'edit'>('init')

const isLoading = ref(false)
const loading = ref(true)

const templateOptions = computed(() =>
  timings.value.filter(t => t.id).map(t => ({ label: t.isDefault ? `${t.name} (Default)` : t.name, value: t.id }))
)

const timingId = ref('')

async function fetchDays() {
  if (!timingId.value) return

  loading.value = true
  try {
    await store.getWorkingDays({ timingId: timingId.value })
    mode.value = store.isWorkingDaysEmpty ? 'init' : 'created'
  } catch (error: any) {
    useNotify().error(error?.message || error)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    isLoading.value = true
    await store.setWorkingDay({
      timingId: timingId.value,
      days: workingDays.value
    })
    mode.value = 'created'
  } catch (error: any) {
    useNotify().error(error?.message || error)
  } finally {
    isLoading.value = false
  }
}

watch(timingId, fetchDays)

watch(templateOptions, (options) => {
  if (!timingId.value && options.length) {
    timingId.value = options.find(o => o.label.includes('(Default)'))?.value || options[0].value
  }
}, { immediate: true })

onMounted(async () => {
  try {
    if (!timings.value.length) await store.listTimings()
  } catch (error: any) {
    useNotify().error(error?.message || error)
  }
})
</script>
