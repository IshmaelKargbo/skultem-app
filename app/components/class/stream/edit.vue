<template>
    <USlideover :dismissible="false" title="Edit Stream" :open="open" @update:open="open = $event">
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Edit Stream</p>
                <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="open = false" />
            </div>
        </template>

        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Art, Science, Com" :disabled="isLoading" class="w-full" />
                    <template #hint>
                        <p class="text-xs text-muted">Renaming updates it everywhere the stream is used.</p>
                    </template>
                </UFormField>
                <UFormField label="Description" name="description">
                    <UTextarea v-model="state.description" placeholder="Enter description" :disabled="isLoading" class="w-full" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex w-full items-center gap-3">
                <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="open = false" />
                <!-- Delete lives here now that the list's rows open this form. -->
                <UButton v-if="canDelete" class="ml-auto" label="Delete" icon="i-lucide-trash-2" color="error"
                    variant="soft" :disabled="isLoading" @click="askDelete" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const props = defineProps<{ record: Stream | null, canDelete?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [stream: Stream], delete: [stream: Stream] }>()
const { error: toastError, success: toastSuccess } = useNotify()

const isLoading = ref(false)
const formRef = ref<any>(null)
const state = reactive({ name: '', description: '' })

const schema = yup.object({
    name: yup.string().trim().required('Name is required')
})

// Filled from the stream each time the form opens.
watch(open, (isOpen) => {
    if (isOpen && props.record) {
        state.name = props.record.name ?? ''
        state.description = props.record.description ?? ''
    }
}, { immediate: true })

function askDelete() {
    if (!props.record) return
    open.value = false
    emit('delete', props.record)
}

async function onSubmit() {
    if (!props.record) return
    isLoading.value = true
    try {
        const updated = await StreamApi().update(props.record.id, {
            name: state.name.trim(),
            description: state.description.trim()
        })
        if (updated) {
            toastSuccess('Stream updated')
            emit('saved', updated)
            open.value = false
        }
    } catch (err: any) {
        toastError(err?.message || 'Stream could not be updated')
    } finally {
        isLoading.value = false
    }
}
</script>
