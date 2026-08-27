<script setup lang="ts">
const props = defineProps<{
  open: boolean
  termId: string
  termName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useTermStore()
const { error: toastError, success: toastSuccess } = useNotify()

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
    await store.remove(props.termId)
    toastSuccess('Term deleted successfully')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to delete term')
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
            Delete Term
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Remove '${termName}'? Only an upcoming term can be deleted.`"
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
