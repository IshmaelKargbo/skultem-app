<template>
    <USlideover :dismissible="false" title="Edit parent details" :open="open" @update:open="open = $event">
        <template #header>
            <div class="flex w-full items-center justify-between">
                <div>
                    <p class="text-lg font-semibold">Edit parent details</p>
                    <p class="text-xs text-muted">{{ studentName }}</p>
                </div>
                <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="open = false" />
            </div>
        </template>

        <template #body>
            <div class="space-y-6">
                <UAlert color="neutral" variant="soft" icon="i-lucide-info"
                    description="The father's and mother's details recorded for this student. The guardian who signs in to the parent portal is changed with Edit guardian / Change guardian." />

                <section class="space-y-3">
                    <p class="text-sm font-semibold">Father</p>
                    <UFormField label="Name">
                        <UInput v-model="state.fatherName" class="w-full" :disabled="saving" placeholder="Full name" />
                    </UFormField>
                    <UFormField label="Phone">
                        <UInput v-model="state.fatherContact" class="w-full" :disabled="saving" type="tel"
                            placeholder="e.g. 076 123456" />
                    </UFormField>
                    <UFormField label="Occupation">
                        <UInput v-model="state.fatherOccupation" class="w-full" :disabled="saving" />
                    </UFormField>
                </section>

                <section class="space-y-3">
                    <p class="text-sm font-semibold">Mother</p>
                    <UFormField label="Name">
                        <UInput v-model="state.motherName" class="w-full" :disabled="saving" placeholder="Full name" />
                    </UFormField>
                    <UFormField label="Phone">
                        <UInput v-model="state.motherContact" class="w-full" :disabled="saving" type="tel"
                            placeholder="e.g. 076 123456" />
                    </UFormField>
                    <UFormField label="Occupation">
                        <UInput v-model="state.motherOccupation" class="w-full" :disabled="saving" />
                    </UFormField>
                </section>
            </div>
        </template>

        <template #footer>
            <div class="flex space-x-3">
                <UButton :icon="SAVE_ICON" :loading="saving" :disabled="!hasName" label="Save" @click="save" />
                <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="open = false" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
// Corrects the father's and mother's details recorded on a student at admission.
const props = defineProps<{
    studentId: string
    studentName: string
    family?: StudentFamilyDetails | null
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()
const { success: toastSuccess, error: toastError } = useNotify()

const saving = ref(false)
const state = reactive<Required<{ [K in keyof StudentFamilyDetails]: string }>>({
    fatherName: '', fatherContact: '', fatherOccupation: '', motherName: '', motherContact: '', motherOccupation: ''
})

// At least one parent's name - the same rule the server applies.
const hasName = computed(() => !!state.fatherName.trim() || !!state.motherName.trim())

// Filled from the student each time the form opens.
watch(open, (isOpen) => {
    if (!isOpen) return
    const f = props.family || {}
    state.fatherName = f.fatherName ?? ''
    state.fatherContact = f.fatherContact ?? ''
    state.fatherOccupation = f.fatherOccupation ?? ''
    state.motherName = f.motherName ?? ''
    state.motherContact = f.motherContact ?? ''
    state.motherOccupation = f.motherOccupation ?? ''
}, { immediate: true })

async function save() {
    if (!hasName.value) return
    saving.value = true
    try {
        const res = await StudentApi().updateFamily(props.studentId, { ...state })
        if (res) {
            toastSuccess('Parent details updated')
            emit('saved')
            open.value = false
        }
    } catch (err: any) {
        toastError(err?.message || 'Parent details could not be updated')
    } finally {
        saving.value = false
    }
}
</script>
