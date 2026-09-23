<script setup lang="ts">
// Takes a playground school live on its behalf - same choices its owner gets under
// Settings > Playground (see PlaygroundGoLivePanel).
const props = defineProps<{
  open: boolean
  school: SystemSchool
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useSystemStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const summary = ref<PlaygroundSummary>()
const loading = ref(false)
const submitting = ref(false)

// Re-fetch every time it opens - counts go stale as the school keeps testing.
watch(() => props.open, async (value) => {
  if (!value) return
  summary.value = undefined
  loading.value = true
  try {
    summary.value = await SystemApi().getPlaygroundSummary(props.school.id)
  } catch (err: any) {
    toastError(err?.message || 'Unable to load playground data')
    open.value = false
  } finally {
    loading.value = false
  }
}, { immediate: true })

async function onSubmit(payload: GoLivePayload) {
  submitting.value = true
  try {
    const updated = await store.moveToProduction(props.school.id, payload)
    if (!updated) return

    toastSuccess(`${clean(props.school.name)} is now live`)
    open.value = false
  } catch (err: any) {
    toastError(err?.message || 'Unable to take the school live')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-3xl' }">
    <template #content>
      <UCard :ui="{ body: 'max-h-[70vh] overflow-y-auto' }">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold">Take Live · {{ clean(school.name) }}</h3>
              <p class="text-sm text-muted">Clear the school's test data and turn playground mode off.</p>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" aria-label="Close"
              @click="open = false" />
          </div>
        </template>

        <div v-if="loading" class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <USkeleton v-for="i in 6" :key="i" class="h-24 w-full rounded-xl" />
        </div>

        <PlaygroundGoLivePanel v-else-if="summary" :summary="summary" :submitting="submitting" @submit="onSubmit" />
      </UCard>
    </template>
  </UModal>
</template>
