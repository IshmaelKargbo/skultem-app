<template>
  <div class="flex items-center gap-2">
    <div class="relative size-9 shrink-0 overflow-hidden rounded-lg border border-default shadow-sm">
      <input type="color" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0 opacity-0" />
      <div class="size-full rounded-lg" :style="{ backgroundColor: modelValue }" />
      <UIcon name="i-lucide-pipette"
        :class="[
          'absolute bottom-0.5 right-0.5 size-3 drop-shadow',
          modelValue === '#ffffff' ? 'text-gray-600' : 'text-white/80'
        ]" />
    </div>
    <input :value="modelValue" maxlength="7"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="h-9 w-full rounded-lg border border-default bg-transparent px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [string]
}>()
</script>
