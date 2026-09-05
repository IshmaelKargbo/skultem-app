<script lang="ts" setup>
// Shared by the Salary Template builder and the Add/Edit Salary form - a named list of
// allowance/deduction lines, each either a flat amount or a percentage of basic salary. Whichever
// screen embeds this owns the actual list (v-model); this component is just the row editor plus a
// live per-row resolved-amount preview.
const { modelValue, label, color, basicSalary } = defineProps<{
    modelValue: PayComponentRow[]
    label: string
    color: 'success' | 'error'
    basicSalary: number
}>()

const emit = defineEmits<{ 'update:modelValue': [PayComponentRow[]] }>()

const typeItems = [
    { label: 'Fixed amount', value: 'FIXED' },
    { label: '% of basic', value: 'PERCENTAGE' }
]

function addRow() {
    emit('update:modelValue', [
        ...modelValue,
        { key: crypto.randomUUID(), name: '', type: 'FIXED', value: 0 }
    ])
}

function removeRow(key: string) {
    emit('update:modelValue', modelValue.filter(r => r.key !== key))
}

function updateRow(key: string, patch: Partial<PayComponentRow>) {
    emit('update:modelValue', modelValue.map(r => r.key === key ? { ...r, ...patch } : r))
}

function resolvedAmount(row: PayComponentRow) {
    return resolvePayComponent(row, basicSalary)
}

const total = computed(() => modelValue.reduce((sum, row) => sum + resolvedAmount(row), 0))
</script>

<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="h-4 w-1 rounded-full" :class="color === 'success' ? 'bg-success' : 'bg-error'" />
                <h3 class="text-sm font-semibold text-highlighted">{{ label }}</h3>
            </div>
            <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-plus" label="Add line" @click="addRow" />
        </div>

        <div v-if="!modelValue.length"
            class="flex flex-col items-center gap-1 rounded-xl border border-dashed border-default py-6 text-center">
            <p class="text-xs text-muted">No {{ label.toLowerCase() }} yet.</p>
        </div>

        <div v-else class="space-y-2">
            <div v-for="row in modelValue" :key="row.key"
                class="grid grid-cols-1 gap-2 rounded-xl border border-default p-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
                <UInput :model-value="row.name" placeholder="e.g. Housing Allowance"
                    @update:model-value="(v: string) => updateRow(row.key, { name: v })" />

                <USelectMenu :model-value="row.type" value-key="value" :items="typeItems" class="w-full sm:w-36"
                    @update:model-value="(v: string) => updateRow(row.key, { type: v as PayComponentType })" />

                <UInput :model-value="row.value" type="number" min="0" class="w-full sm:w-28"
                    @update:model-value="(v: string) => updateRow(row.key, { value: Number(v) || 0 })">
                    <template #trailing>
                        <span class="text-xs text-muted">{{ row.type === 'PERCENTAGE' ? '%' : 'Le' }}</span>
                    </template>
                </UInput>

                <p class="text-right text-xs text-muted sm:w-24" :class="color === 'success' ? 'text-success' : 'text-error'">
                    {{ color === 'success' ? '+' : '-' }} Le {{ resolvedAmount(row).toLocaleString() }}
                </p>

                <UButton icon="i-lucide-trash-2" size="sm" variant="ghost" color="error" class="justify-self-end"
                    @click="removeRow(row.key)" />
            </div>
        </div>

        <div v-if="modelValue.length" class="flex items-center justify-between border-t border-default pt-2 text-sm">
            <span class="text-muted">Total {{ label.toLowerCase() }}</span>
            <span class="font-semibold" :class="color === 'success' ? 'text-success' : 'text-error'">
                Le {{ total.toLocaleString() }}
            </span>
        </div>
    </div>
</template>
