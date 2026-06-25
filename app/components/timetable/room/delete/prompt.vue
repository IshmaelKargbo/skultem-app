<script setup lang="ts">
const props = defineProps<{
  open: boolean
  index: string
  roomId: string
  roomName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const loading = ref(false)
const confirmation = ref('')

const isValid = computed(
  () => confirmation.value.trim() === props.roomName
)

function close() {
  open.value = false
  confirmation.value = ''
}

async function deleteRoom() {
  if (!isValid.value) return

  try {
    loading.value = true

    await useTimetableStore().deleteRoom(props.roomId, props.index)
    close()
  } catch (error: any) {
    useNotify().error(error)
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
            Delete Room
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert color="error" variant="soft" title="This action cannot be undone"
            description="Deleting this room may affect timetable entries and other records that reference it." />

          <p class="text-sm text-muted">
            To confirm, type the room name below:
          </p>

          <div class="rounded-lg border-2 border-error-200 bg-error-50/30 p-3 font-mono font-semibold">
            {{ roomName }}
          </div>

          <UInput v-model="confirmation" :placeholder="`Type '${roomName}'`" />


        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" variant="soft" @click="close" />

            <UButton label="Delete Room" color="error" class="disabled:bg-error-200" :loading="loading"
              :disabled="!isValid || loading" @click="deleteRoom" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>