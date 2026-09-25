<script setup lang="ts">
// For a guardian added by mistake. Irreversible; the server refuses while a student still has this
// parent as their guardian (delete or re-link those students first). The full name is the confirmation.
const props = defineProps<{
  open: boolean
  parent: Parent
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  deleted: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useParentStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)
const confirmation = ref('')

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
const matches = computed(() => !!props.parent.name && normalize(confirmation.value) === normalize(props.parent.name))

watch(() => props.open, (isOpen) => {
  if (isOpen) confirmation.value = ''
})

async function confirm() {
  if (!matches.value) return

  loading.value = true
  try {
    const res = await store.deletePermanently(props.parent.id, confirmation.value.trim())
    toastSuccess(`${res?.parentName ?? props.parent.name} was permanently deleted.`)
    emit('deleted')
    open.value = false
  } catch (err: any) {
    toastError(err?.message || 'Failed to delete the parent')
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
          <h3 class="text-lg font-semibold text-error">
            Delete parent permanently
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert color="error" variant="soft" icon="lucide:triangle-alert" :title="`Delete ${parent.name}?`">
            <template #description>
              <p>This cannot be undone. It permanently removes the guardian record and their portal login.</p>
              <p v-if="parent.students > 0" class="mt-2 font-medium">
                {{ parent.name }} is still the guardian of {{ parent.students }} student{{ parent.students === 1 ? '' : 's' }}.
                Delete those students (or link them to another guardian) first, or this will be refused.
              </p>
              <p v-else class="mt-2">Use this for a parent added by mistake.</p>
            </template>
          </UAlert>

          <UFormField :label="`Type ${parent.name} to confirm`" required>
            <UInput v-model="confirmation" class="w-full" :disabled="loading" :placeholder="parent.name"
              autocomplete="off" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="open = false" />
            <UButton label="Delete permanently" color="error" icon="lucide:trash-2" :loading="loading"
              :disabled="!matches" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
