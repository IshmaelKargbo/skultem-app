<script setup lang="ts">
// Type-to-confirm delete: the Delete button stays disabled until the typed text matches
// `itemName` exactly, so a destructive action needs a deliberate extra step instead of one
// misplaced click on a plain "Are you sure?" modal. The caller owns the actual delete call (pass
// it as `onConfirm`) and stays in charge of its own success/error toast, same as before - this
// component only owns the confirmation gate and the loading/close mechanics around it.
const { open, title, itemName, description, confirmLabel = 'Delete' } = defineProps<{
    open: boolean
    title: string
    itemName: string
    description?: string
    confirmLabel?: string
    onConfirm: () => Promise<void>
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const isOpen = computed({
    get: () => open,
    set: (v: boolean) => emit('update:open', v)
})

const typed = ref('')
const loading = ref(false)

const matches = computed(() => typed.value.trim() === itemName.trim())

function close() {
    isOpen.value = false
}

async function confirm() {
    if (!matches.value) return

    loading.value = true
    try {
        await onConfirm()
        close()
    } finally {
        loading.value = false
    }
}

// Clear the typed text whenever the modal re-opens (for a different item, or reopened after a
// cancel) so a stale match from a previous delete can't silently carry over.
watch(() => open, (value) => {
    if (value) typed.value = ''
})
</script>

<template>
    <UModal v-model:open="isOpen">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                </template>

                <div class="space-y-4">
                    <UAlert color="error" variant="soft" title="This action cannot be undone"
                        :description="description || `This will permanently remove '${itemName}'.`" />

                    <UFormField :label="`Type &quot;${itemName}&quot; to confirm`">
                        <UInput v-model="typed" :placeholder="itemName" class="w-full" @keyup.enter="confirm" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />

                        <UButton :label="confirmLabel" color="error" :loading="loading" :disabled="!matches || loading"
                            @click="confirm" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
