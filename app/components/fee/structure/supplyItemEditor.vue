<script lang="ts" setup>
// A supply fee can bundle several materials - e.g. a Uniform fee carrying the Uniform itself, a
// House Colour, and a Necktie, each its own line with its own quantity - instead of being limited
// to one material. Shared by the Add and Edit fee structure forms.
type SupplyItemRow = { key: string, materialId: string, quantity: number }

const { modelValue, materials } = defineProps<{
    modelValue: SupplyItemRow[]
    materials: { label: string, value: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [SupplyItemRow[]] }>()

function addRow() {
    emit('update:modelValue', [
        ...modelValue,
        { key: crypto.randomUUID(), materialId: '', quantity: 1 }
    ])
}

function removeRow(key: string) {
    emit('update:modelValue', modelValue.filter(r => r.key !== key))
}

function updateRow(key: string, patch: Partial<SupplyItemRow>) {
    emit('update:modelValue', modelValue.map(r => r.key === key ? { ...r, ...patch } : r))
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <p class="font-medium">Supply Items</p>
            <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-plus" label="Add item" @click="addRow" />
        </div>

        <p class="text-xs text-muted">
            Every material this fee includes - e.g. Uniform, House Colour and Necktie as three
            separate lines, each with its own quantity.
        </p>

        <div v-if="!modelValue.length"
            class="flex flex-col items-center gap-1 rounded-xl border border-dashed border-default py-6 text-center">
            <p class="text-xs text-muted">No supply items yet.</p>
        </div>

        <div v-else class="space-y-2">
            <div v-for="row in modelValue" :key="row.key"
                class="grid grid-cols-1 gap-2 rounded-xl border border-default p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <USelectMenu :model-value="row.materialId" value-key="value" :items="materials"
                    placeholder="Select material"
                    @update:model-value="(v: string) => updateRow(row.key, { materialId: v })" />

                <UInput :model-value="row.quantity" type="number" min="1" class="w-full sm:w-28"
                    placeholder="Quantity" @update:model-value="(v: string) => updateRow(row.key, { quantity: Number(v) || 1 })" />

                <UButton icon="i-lucide-trash-2" size="sm" variant="ghost" color="error" class="justify-self-end"
                    @click="removeRow(row.key)" />
            </div>
        </div>
    </div>
</template>
