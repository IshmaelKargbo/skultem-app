<script setup lang="ts">
defineProps<{
  modelValue: 'table' | 'card'
}>()

defineEmits<{
  'update:modelValue': [value: 'table' | 'card']
}>()
</script>

<template>
  <div class="hidden items-center justify-end gap-1 md:flex">
    <div class="flex items-center gap-1">
      <UButton
        :variant="modelValue === 'table' ? 'subtle' : 'ghost'"
        :color="modelValue === 'table' ? 'secondary' : 'neutral'"
        icon="i-lucide-table"
        square
        aria-label="Table view"
        @click="$emit('update:modelValue', 'table')"
      />
      <UButton
        :variant="modelValue === 'card' ? 'subtle' : 'ghost'"
        :color="modelValue === 'card' ? 'secondary' : 'neutral'"
        icon="i-lucide-layout-grid"
        square
        aria-label="Card view"
        @click="$emit('update:modelValue', 'card')"
      />
    </div>
  </div>
</template>
