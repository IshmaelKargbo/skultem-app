<template>
    <UForm ref="form" :schema="schema" :state="state" @error="onError">
        <UCard variant="subtle">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-base">Filters ({{ state.filters.length }})</p>
                    <p class="text-xs text-mute">Add conditions to filter your data. Available fields: Date, Class,
                        Status, Month</p>
                </div>
                <div>
                    <UButton @click="addFilter" label="Add Filter" :icon="ADD_ICON" variant="outline" color="neutral" />
                </div>
            </div>

            <div class="mt-3 space-y-3">
                <UCard v-if="state.filters.length > 0" v-for="(item, index) in state.filters" :key="index">
                    <div class="flex space-x-3">

                        <UFormField
                            :name="`filters[${index}].field`"
                            label="Field"
                            class="flex-1"
                            required
                        >
                            <USelectMenu
                                v-model="item.field"
                                value-key="value"
                                placeholder="Select Field"
                                :items="availableFields(index)"
                                @change="fieldChange(index)"
                            />
                        </UFormField>

                        <UFormField
                            :name="`filters[${index}].operator`"
                            label="Operator"
                            class="flex-1"
                            required
                        >
                            <USelectMenu
                                v-model="item.operator"
                                value-key="value"
                                placeholder="Select Operator"
                                :items="availableOperators(item.field)"
                                :disabled="!item.field"
                                @change="operatorChange(index)"
                            />
                        </UFormField>

                        <!-- text input -->
                        <UFormField
                            v-if="inputType(item.field, item.operator) === 'text'"
                            :name="`filters[${index}].value`"
                            label="Value"
                            class="flex-1"
                            required
                        >
                            <UInput v-model="item.value" type="text" placeholder="Enter value" />
                        </UFormField>

                        <!-- number input -->
                        <UFormField
                            v-if="inputType(item.field, item.operator) === 'number'"
                            :name="`filters[${index}].value`"
                            label="Value"
                            class="flex-1"
                            required
                        >
                            <UInput v-model="item.value" type="number" placeholder="Enter number" />
                        </UFormField>

                        <!-- range input -->
                        <template v-if="inputType(item.field, item.operator) === 'range'">
                            <UFormField
                                :name="`filters[${index}].valueFrom`"
                                label="From"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.valueFrom" type="number" placeholder="From" />
                            </UFormField>
                            <UFormField
                                :name="`filters[${index}].valueTo`"
                                label="To"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.valueTo" type="number" placeholder="To" />
                            </UFormField>
                        </template>

                        <!-- date input -->
                        <UFormField
                            v-if="inputType(item.field, item.operator) === 'date'"
                            :name="`filters[${index}].value`"
                            label="Value"
                            class="flex-1"
                            required
                        >
                            <UInput v-model="item.value" type="date" placeholder="Select date" />
                        </UFormField>

                        <!-- date-range input -->
                        <template v-if="inputType(item.field, item.operator) === 'date-range'">
                            <UFormField
                                :name="`filters[${index}].valueFrom`"
                                label="From"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.valueFrom" type="date" placeholder="From date" />
                            </UFormField>
                            <UFormField
                                :name="`filters[${index}].valueTo`"
                                label="To"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.valueTo" type="date" placeholder="To date" />
                            </UFormField>
                        </template>

                        <!-- select input -->
                        <UFormField
                            v-if="inputType(item.field, item.operator) === 'select'"
                            :name="`filters[${index}].value`"
                            label="Value"
                            class="flex-1"
                            required
                        >
                            <USelectMenu
                                v-model="item.value"
                                value-key="value"
                                :items="operatorOptions(item.field, item.operator)"
                                placeholder="Select value"
                            />
                        </UFormField>

                        <!-- multi-select input -->
                        <UFormField
                            v-if="inputType(item.field, item.operator) === 'multi-select'"
                            :name="`filters[${index}].values`"
                            label="Value"
                            class="flex-1"
                            required
                        >
                            <USelectMenu
                                v-model="item.values"
                                value-key="value"
                                multiple
                                :items="operatorOptions(item.field, item.operator)"
                                placeholder="Select values"
                            />
                        </UFormField>

                        <div class="mt-6">
                            <UButton color="error" @click="remove(index)" :icon="DELETE_ICON" variant="ghost" />
                        </div>
                    </div>
                </UCard>

                <UCard v-else>
                    <div class="flex flex-col items-center space-y-2 p-4">
                        <UIcon :name="FILTER_ICON" class="text-4xl text-mute" />
                        <p class="text-muted">No filters added yet</p>
                        <p class="text-mute">Click "Add Filter" to create conditions</p>
                    </div>
                </UCard>
            </div>
        </UCard>
    </UForm>
</template>

<script setup lang="ts">
import * as yup from 'yup'

type FilterState = {
    field: string
    operator: string
    value: string
    valueFrom: string
    valueTo: string
    values: string[]
}

type ReportBuilder = {
    name: string
    filters: FilterState[]
}

const emit = defineEmits<{
    change: [payload: ReportSelectPayload]
}>()

const { selected: entity } = defineProps<{
    selected: ReportSelectPayload
}>()

const form = ref()

const state = reactive<ReportBuilder>({
    name: "",
    filters: []
})

const fields = computed(() => entity.filters.map(e => ({ label: e.label, value: e.field })))

const schema = computed(() =>
    yup.object({
        filters: yup.array().of(
            yup.lazy((item: FilterState) => {
                const type = inputType(item?.field, item?.operator)

                const base = {
                    field: yup.string().required("Field is required"),
                    operator: yup.string().required("Operator is required"),
                    value: yup.string(),
                    valueFrom: yup.string(),
                    valueTo: yup.string(),
                    values: yup.array().of(yup.string()),
                }

                switch (type) {
                    case 'text':
                    case 'select':
                        return yup.object({
                            ...base,
                            value: yup.string().required("Value is required"),
                        })

                    case 'number':
                        return yup.object({
                            ...base,
                            value: yup
                                .number()
                                .typeError("Value must be a number")
                                .required("Value is required"),
                        })

                    case 'date':
                        return yup.object({
                            ...base,
                            value: yup
                                .date()
                                .typeError("Enter a valid date")
                                .required("Date is required"),
                        })

                    case 'range':
                        return yup.object({
                            ...base,
                            valueFrom: yup
                                .number()
                                .typeError("Must be a number")
                                .required("From value is required"),
                            valueTo: yup
                                .number()
                                .typeError("Must be a number")
                                .required("To value is required")
                                .min(yup.ref('valueFrom'), "To must be ≥ From"),
                        })

                    case 'date-range':
                        return yup.object({
                            ...base,
                            valueFrom: yup
                                .date()
                                .typeError("Enter a valid date")
                                .required("From date is required"),
                            valueTo: yup
                                .date()
                                .typeError("Enter a valid date")
                                .required("To date is required")
                                .min(yup.ref('valueFrom'), "To date must be on or after From date"),
                        })

                    case 'multi-select':
                        return yup.object({
                            ...base,
                            values: yup
                                .array()
                                .of(yup.string().required())
                                .min(1, "Select at least one value")
                                .required("Value is required"),
                        })

                    default:
                        return yup.object(base)
                }
            }) as any
        )
    })
)

// --- Helpers ---
function fieldChange(index: number) {
    const selected = state.filters[index]
    if (selected == null) return
    selected.operator = ""
    resetFilterValue(selected)
}

function operatorChange(index: number) {
    const selected = state.filters[index]
    if (selected == null) return
    resetFilterValue(selected)
}

function resetFilterValue(filter: FilterState) {
    filter.value = ""
    filter.valueFrom = ""
    filter.valueTo = ""
    filter.values = []
}

const availableFields = (index: number) => {
    const selected = state.filters
        .map((a, i) => (i !== index ? a.field : null))
        .filter(Boolean)
    return fields.value.filter(s => !selected.includes(s.value))
}

const availableOperators = (field: string) => {
    const found = entity.filters.find(e => e.field === field)
    if (!found) return []
    return found.operators.map(e => ({ label: e.name, value: e.operator }))
}

const operatorOptions = (field: string, opVal: string) => {
    const found = entity.filters.find(e => e.field === field)
    if (!found) return []
    const operator = found.operators.find(e => e.operator === opVal)
    return operator?.options ?? []
}

function inputType(field: string, opVal: string): string | null {
    if (!field || !opVal) return null
    const found = entity.filters.find(e => e.field === field)
    if (!found) return null
    const operator = found.operators.find(e => e.operator === opVal)
    return operator?.input ?? null
}

function addFilter() {
    state.filters.push({
        field: "",
        operator: "",
        value: "",
        valueFrom: "",
        valueTo: "",
        values: [],
    })
}

function remove(index: number) {
    state.filters.splice(index, 1)
}

function onError(errors: any) {
    // UForm fires this when validate() finds errors.
    // Add any side-effects here (e.g. toast notifications).
    console.warn('Filter validation errors:', errors)
}

// Expose validate() so a parent can await form validation before submitting.
async function validate(): Promise<boolean> {
    try {
        await form.value?.validate()
        return true
    } catch {
        return false
    }
}

defineExpose({ validate })

watch(
    () => entity,
    (val) => {
        if (!val) return
        state.name = val.name
        state.filters = []
    },
    { immediate: true }
)

// Only emit when the full state passes Yup validation
watch(state, async (val) => {
    try {
        await schema.value.validate(val, { abortEarly: false })
        emit("change", {
            name: val.name,
            filters: val.filters,
        })
    } catch {
        // Suppress — per-field errors are surfaced by UForm via name bindings
    }
}, { deep: true })
</script>