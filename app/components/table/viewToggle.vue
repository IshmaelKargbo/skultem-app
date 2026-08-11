<script setup lang="ts">
defineProps<{
  modelValue: 'table' | 'card'
}>()

defineEmits<{
  'update:modelValue': [value: 'table' | 'card']
}>()
</script>

<template>
  <div class="mb-3 hidden items-center justify-end gap-1 md:flex">
    <div class="flex items-center gap-2 space-x-4 rounded-2xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900">
      <UButton
        :variant="modelValue === 'table' ? 'solid' : 'ghost'"
        :color="modelValue === 'table' ? 'secondary' : 'neutral'"
        size="sm"
        icon="i-lucide-table"
        label="Table view"
        square
        aria-label="Table view"
        @click="$emit('update:modelValue', 'table')"
      />
      <UButton
        :variant="modelValue === 'card' ? 'solid' : 'ghost'"
        :color="modelValue === 'card' ? 'secondary' : 'neutral'"
        size="sm"
        icon="i-lucide-layout-grid"
        label="Card view"
        square
        aria-label="Card view"
        @click="$emit('update:modelValue', 'card')"
      />
    </div>
  </div>
</template>
