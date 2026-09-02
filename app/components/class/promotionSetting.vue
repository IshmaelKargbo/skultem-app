<script lang="ts" setup>
const { can } = useAuth()
const store = useClassStore()
const {record, loading} = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()
const { id } = defineProps<{
    id: string
}>()

const canManagePromotion = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const savingTerminal = ref(false)

const savingNextClass = ref(false)

const otherClasses = computed(() =>
    store.records
        .filter((c) => c.id !== record.value?.id)
        .map((c) => ({ label: c.name, value: c.id }))
)


async function toggleTerminal(value: boolean) {
    if (!record.value) return

    savingTerminal.value = true
    try {
        const res = await store.setTerminal(record.value.id, value)
        if (res) {
            toastSuccess(value
                ? 'Marked as a graduating class - promoted students will graduate instead of moving up'
                : 'No longer a graduating class')
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to update class')
    } finally {
        savingTerminal.value = false
    }
}

const nextClassId = computed<string>({
    get: () => record.value?.nextClass?.id || '',
    set: async (value: string) => {
        if (!record.value) return
        if (!value || value === record.value?.nextClass?.id) return

        savingNextClass.value = true
        try {
            const res = await store.setNextClass(record.value.id, value)
            if (res) toastSuccess(`This class now promotes to ${res.nextClass?.name}`)
        } catch (err: any) {
            toastError(err?.message || 'Failed to set next class')
        } finally {
            savingNextClass.value = false
        }
    }
})

function fetchClass() {
    store.viewClass(id)
}

watch(() => id, () => {
    fetchClass()
})
</script>

<template>
    <UCard v-if="canManagePromotion">
        <template #header>
            <div class="flex items-center gap-2">
                <UIcon :name="PROMOTE_STUDENTS_ICON" class="size-4 text-primary" />
                <h3 class="text-sm font-semibold">Promotion Settings</h3>
            </div>
        </template>

        <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex items-center justify-between gap-3 rounded-xl border border-default p-3">
                <div class="min-w-0 pr-3">
                    <p class="text-sm font-medium text-highlighted">Graduating class</p>
                    <p class="text-xs text-muted">e.g. Class 6, JSS 3, SSS 3 - promoted students graduate instead of
                        moving
                        up</p>
                </div>
                <USwitch :model-value="!!record?.terminal" :loading="savingTerminal" :disabled="savingTerminal"
                    @update:model-value="toggleTerminal" />
            </div>

            <UFormField label="Promotes to"
                :hint="record?.terminal ? 'Disabled while this is a graduating class' : 'The class students move up to when promoted'">
                <USelectMenu v-model="nextClassId" value-key="value" :items="otherClasses"
                    :disabled="!!record?.terminal || savingNextClass" :loading="savingNextClass"
                    placeholder="Select next class" class="w-full" />
            </UFormField>
        </div>
    </UCard>
</template>
