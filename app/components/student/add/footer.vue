<script lang="ts" setup>
// Step actions for the enroll form. Must sit inside the step's UForm - Next is its submit button.
withDefaults(defineProps<{
    showBack?: boolean
    nextLabel?: string
    loading?: boolean
}>(), {
    showBack: true,
    nextLabel: 'Continue',
    loading: false
})

defineEmits<{ back: [] }>()
</script>

<template>
    <div
        class="sticky bottom-0 z-10 flex gap-2 rounded-b-[calc(var(--ui-radius)*2)] border-t border-default bg-default/95 px-4 py-3 backdrop-blur sm:justify-end md:px-5 md:py-4">
        <UButton v-if="showBack" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" size="lg"
            class="flex-1 justify-center sm:flex-none" :disabled="loading" @click="$emit('back')" />
        <UButton type="submit" :trailing-icon="NEXT_ICON" :label="nextLabel" :loading="loading" size="lg"
            class="flex-[2] justify-center sm:flex-none" />
    </div>
</template>
