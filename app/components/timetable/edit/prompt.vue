<script setup lang="ts">
const props = defineProps<{
    open: boolean
    period: Period
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const open = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
})

const loading = ref(false)
const startTime = ref(props.period.startTime)
const endTime = ref(props.period.endTime)

watch(() => props.period, (period) => {
    startTime.value = period.startTime
    endTime.value = period.endTime
})

const isValid = computed(() =>
    !!startTime.value && !!endTime.value && startTime.value < endTime.value
)

function close() {
    open.value = false
}

async function save() {
    if (!isValid.value) return

    try {
        loading.value = true
        await useTimetableStore().updatePeriod(props.period.id, {
            startTime: startTime.value,
            endTime: endTime.value
        })
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
                        Adjust {{ period.name }} Time
                    </h3>
                </template>

                <div class="space-y-4">
                    <UAlert color="primary" variant="soft" title="Only affects this class"
                        description="This change applies to this class's timetable only - every other class keeps its own schedule." />

                    <div class="grid gap-3 sm:grid-cols-2">
                        <UFormField label="Starts">
                            <UInput v-model="startTime" type="time" class="w-full" />
                        </UFormField>
                        <UFormField label="Ends">
                            <UInput v-model="endTime" type="time" class="w-full" />
                        </UFormField>
                    </div>

                    <p v-if="startTime && endTime && startTime >= endTime" class="text-sm text-error">
                        Start time must be before end time.
                    </p>
                </div>
                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" variant="soft" @click="close" />

                        <UButton label="Save" :disabled="!isValid" :loading="loading" @click="save" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
