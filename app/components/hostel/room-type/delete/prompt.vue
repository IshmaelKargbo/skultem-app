<script setup lang="ts">
const props = defineProps<{
  open: boolean
  typeId: string
  typeName: string
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
    useHostelStore().deleteRoomType(props.typeId)
    close()
  } catch (error: any) {
    useNotify().error(error?.message || 'Failed to delete room type')
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
            Delete Room Type
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Remove '${typeName}' from room types? Types with rooms assigned to them cannot be deleted.`"
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" @click="close" />

            <UButton label="Delete Room Type" color="error" :loading="loading" :disabled="loading" @click="remove" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
