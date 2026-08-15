<template>
  <UCard>
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
          <div>
            <h3 class="font-semibold">Working Days</h3>
            <p class="text-sm text-muted hidden md:block">
              Choose days classes are held
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

    <div class="space-y-3">
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
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { workingDays } = storeToRefs(store)
const mode = ref<'init' | 'created' | 'edit'>('init')

const isLoading = ref(false)

async function save() {
  try {
    isLoading.value = true
    await store.setWorkingDay({
      days: workingDays.value
    })
    mode.value = 'created'
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await store.getWorkingDays()
    mode.value = store.isWorkingDaysEmpty ? 'init' : 'created'
  } catch (error: any) {
    useNotify().error(error)
  }
})
</script>
