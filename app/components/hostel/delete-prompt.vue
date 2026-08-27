<script setup lang="ts">
const props = defineProps<{
  open: boolean
  hostelId: string
  hostelName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const loading = ref(false)

function close() {
  open.value = false
}

function deleteHostel() {
  loading.value = true

  try {
    useHostelStore().deleteHostel(props.hostelId)
    useNotify().success('Hostel deleted')
    close()
  } catch (error: any) {
    useNotify().error(error?.message || 'Failed to delete hostel')
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
            Delete Hostel
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Remove '${hostelName}' from the facility list? Hostels that still have rooms assigned cannot be deleted.`"
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" @click="close" />

            <UButton label="Delete Hostel" color="error" :loading="loading" :disabled="loading" @click="deleteHostel" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
