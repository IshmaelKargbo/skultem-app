<script setup lang="ts">
const props = defineProps<{
  open: boolean
  entryId: string
  entryTitle: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const loading = ref(false)

function close() {
  open.value = false
}

async function remove() {
  try {
    loading.value = true
    await useCommunicateStore().deleteEntry(props.entryId)
    close()
  } catch (error: any) {
    useNotify().error(error?.message || 'Failed to delete entry')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Delete Entry
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Remove '${entryTitle}' from the calendar?`"
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" @click="close" />

            <UButton label="Delete" color="error" :loading="loading" :disabled="loading" @click="remove" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
