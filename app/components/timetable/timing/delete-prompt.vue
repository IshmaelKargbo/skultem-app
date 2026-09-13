<script setup lang="ts">
const props = defineProps<{
    open: boolean
    timingId: string
    timingName: string
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const open = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
})

const loading = ref(false)
const confirmation = ref('')

const isValid = computed(() =>
    confirmation.value.trim() === props.timingName
)

function close() {
    open.value = false
    confirmation.value = ''
}

async function remove() {
    if (!isValid.value) return

    try {
        loading.value = true
        await useTimetableStore().deleteTiming(props.timingId)
        close()
    } catch (error: any) {
        useNotify().error(error?.message || error)
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
                    <h3 class="font-semibold text-lg">
                        Delete Timing Template
                    </h3>
                </template>

                <div class="space-y-4">
                    <UAlert color="error" variant="soft" title="This action cannot be undone"
                        description="Any Level currently using this template will fall back to the default one." />
                    <p class="text-sm text-muted">
                        To confirm, type:
                    </p>

                    <div class="rounded-lg border-2 bg-error-50/30 border-error-200 p-3 font-mono font-semibold">
                        {{ timingName }}
                    </div>

                    <UInput v-model="confirmation" :placeholder="`Type '${timingName}'`" />
                </div>
                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" variant="soft" @click="close" />

                        <UButton label="Delete Template" color="error" class="disabled:bg-error-200"
                            :disabled="!isValid" :loading="loading" @click="remove" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
