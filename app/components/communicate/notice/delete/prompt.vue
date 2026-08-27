<script setup lang="ts">
const props = defineProps<{
  open: boolean
  noticeId: string
  noticeTitle: string
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
    await useCommunicateStore().deleteNotice(props.noticeId)
    close()
  } catch (error: any) {
    useNotify().error(error?.message || 'Failed to delete notice')
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
            Delete Notice
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Remove '${noticeTitle}' from the notice board?`"
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" @click="close" />

            <UButton label="Delete Notice" color="error" :loading="loading" :disabled="loading" @click="remove" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
