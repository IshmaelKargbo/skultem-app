<template>
    <UForm ref="form" :schema="schema" :state="state" @submit="run">
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
                <template v-if="state.filters.length > 0">
                    <UCard v-for="(item, index) in state.filters" :key="index">
                        <div class="flex space-x-3">

                            <UFormField :name="`filters.${index}.field`" label="Field" class="flex-1" required>
                                <USelectMenu
                                    v-model="item.field"
                                    value-key="value"
                                    placeholder="Select Field"
                                    :items="availableFields(index)"
                                    @change="fieldChange(index)"
                                />
                            </UFormField>

                            <UFormField :name="`filters.${index}.operator`" label="Operator" class="flex-1" required>
                                <USelectMenu
                                    v-model="item.operator"
                                    value-key="value"
                                    placeholder="Select Operator"
                                    :items="availableOperators(item.field)"
                                    :disabled="!item.field"
                                    @change="operatorChange(index)"
                                />
                            </UFormField>

                            <!-- text -->
                            <UFormField
                                v-if="inputType(item.field, item.operator) === 'text'"
                                :name="`filters.${index}.value`"
                                label="Value"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.value" type="text" placeholder="Enter value" />
                            </UFormField>

                            <!-- number -->
                            <UFormField
                                v-if="inputType(item.field, item.operator) === 'number'"
                                :name="`filters.${index}.value`"
                                label="Value"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.value" type="number" placeholder="Enter number" />
                            </UFormField>

                            <!-- range -->
                            <template v-if="inputType(item.field, item.operator) === 'range'">
                                <UFormField :name="`filters.${index}.value`" label="From" class="flex-1" required>
                                    <UInput v-model="item.value" type="number" placeholder="From" />
                                </UFormField>
                                <UFormField :name="`filters.${index}.valueTo`" label="To" class="flex-1" required>
                                    <UInput v-model="item.valueTo" type="number" placeholder="To" />
                                </UFormField>
                            </template>

                            <!-- date -->
                            <UFormField
                                v-if="inputType(item.field, item.operator) === 'date'"
                                :name="`filters.${index}.value`"
                                label="Value"
                                class="flex-1"
                                required
                            >
                                <UInput v-model="item.value" type="date" placeholder="Select date" />
                            </UFormField>

                            <!-- date-range -->
                            <template v-if="inputType(item.field, item.operator) === 'date-range'">
                                <UFormField :name="`filters.${index}.value`" label="From" class="flex-1" required>
                                    <UInput v-model="item.value" type="date" placeholder="From date" />
                                </UFormField>
                                <UFormField :name="`filters.${index}.valueTo`" label="To" class="flex-1" required>
                                    <UInput v-model="item.valueTo" type="date" placeholder="To date" />
                                </UFormField>
                            </template>

                            <!-- select -->
                            <UFormField
                                v-if="inputType(item.field, item.operator) === 'select'"
                                :name="`filters.${index}.value`"
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

                            <!-- multi-select -->
                            <UFormField
                                v-if="inputType(item.field, item.operator) === 'multi-select'"
                                :name="`filters.${index}.values`"
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
                </template>

                <UCard v-else>
                    <div class="flex flex-col items-center space-y-2 p-4">
                        <UIcon :name="FILTER_ICON" class="text-4xl text-mute" />
                        <p class="text-muted">No filters added yet</p>
                        <p class="text-mute">Click "Add Filter" to create conditions</p>
                    </div>
                </UCard>
            </div>
        </UCard>

        <UCard class="mt-5">
            <div class="flex space-x-3">
                <UButton
                    type="submit"
                    :loading="loading"
                    :icon="PLAY_ICON"
                    label="Run Query"
                    class="flex-1 justify-center"
                    size="lg"
                    color="primary"
                />
                <div v-if="isRun" class="flex space-x-3">
                    <UInput class="w-80" placeholder="Report Name" v-model="state.name" />
                    <UButton :icon="SAVE_ICON" label="Save Report" size="lg" color="neutral" variant="outline" />
                </div>
            </div>
        </UCard>
    </UForm>
</template>

<script setup lang="ts">
import * as yup from 'yup'

type FilterState = {
    field: string
    operator: string
    type: string
    value: string
    valueTo: string
    values: string[]
}

type ReportBuilder = {
    name: string
    filters: FilterState[]
}

const { selected: entity } = defineProps<{
    selected: ReportSelectPayload
}>()

const store = useReportStore()
const { loading, run: isRun } = storeToRefs(store)

const state = reactive<ReportBuilder>({
    name: "",
    filters: []
})

const fields = computed(() => entity.filters.map(e => ({ label: e.label, value: e.field })))

const schema = computed(() =>
    yup.object({
        filters: yup.array().of(
            yup.object({
                field: yup.string()
                    .required("Field is required")
                    .min(1, "Field is required"),

                operator: yup.string()
                    .required("Operator is required")
                    .min(1, "Operator is required"),

                type: yup.string(),

                value: yup.string().when(['field', 'operator', 'type'], {
                    is: (field: string, operator: string, type: string) =>
                        !!field && !!operator && ['text', 'select', 'date', 'number', 'range', 'date-range'].includes(type),
                    then: s => s.required("Value is required").min(1, "Value cannot be empty"),
                    otherwise: s => s,
                }),

                valueTo: yup.string().when('type', {
                    is: (type: string) => type === 'range' || type === 'date-range',
                    then: s => s.required("To value is required").min(1, "To value is required"),
                    otherwise: s => s,
                }),

                values: yup.array().of(yup.string()).when('type', {
                    is: (type: string) => type === 'multi-select',
                    then: s => s.min(1, "Select at least one value").required("Please select at least one value"),
                    otherwise: s => s,
                }),
            })
        )
    })
)

async function run() {
    await store.runReport({
        entity: state.name.toLowerCase(),
        filters: state.filters
            .filter(e => e.field && e.operator && e.type)
            .map(e => ({
                field: e.field,
                operator: e.operator,
                type: e.type,
                value: e.value,
                valueTo: e.valueTo,
                values: e.values,
            }))
    }, 1, runtimeConf().limit)
}

function fieldChange(index: number) {
    const selected = state.filters[index]
    if (selected == null) return
    selected.operator = ""
    selected.type = ""
    resetFilterValue(selected)
}

function operatorChange(index: number) {
    const selected = state.filters[index]
    if (selected == null) return
    const found = entity.filters.find(e => e.field === selected.field)
    const operator = found?.operators.find(e => e.operator === selected.operator)
    selected.type = operator?.type ?? ""
    resetFilterValue(selected)
}

function resetFilterValue(filter: FilterState) {
    filter.value = ""
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
        type: "",
        value: "",
        valueTo: "",
        values: [],
    })
}

function remove(index: number) {
    state.filters.splice(index, 1)
}

watch(
    () => entity,
    (val) => {
        if (!val) return
        state.name = val.entity
        state.filters = []
        store.clear()
    },
    { immediate: true }
)
</script>