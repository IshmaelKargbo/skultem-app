<script lang="ts" setup>
const { label, hint, src, muted } = defineProps<{
    label: string
    hint?: string
    src?: string
    muted?: boolean
}>()

const emit = defineEmits<{
    select: [file: File]
    clear: []
}>()

const input = ref<HTMLInputElement | null>(null)

function onChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) emit('select', file)
    if (input.value) input.value.value = ''
}

function trigger() {
    input.value?.click()
}
</script>

<template>
    <div class="space-y-2">
        <p class="text-center text-xs font-medium text-toned">{{ label }}</p>

        <div class="relative mx-auto flex aspect-square w-full max-w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-default"
            :class="muted ? 'bg-muted/30' : ''">
            <img v-if="src" :src="src" :alt="label" class="h-full w-full object-contain p-2">
            <UIcon v-else name="lucide:image-plus" class="text-2xl text-muted" />

            <button v-if="src" type="button"
                class="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-error text-inverted shadow"
                @click="emit('clear')">
                <UIcon name="lucide:x" class="size-3" />
            </button>
        </div>

        <UButton block size="xs" variant="soft" :label="src ? 'Replace' : 'Browse'" icon="lucide:upload" @click="trigger" />
        <input ref="input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon" class="hidden"
            @change="onChange">
        <p v-if="hint" class="text-center text-[11px] text-muted">{{ hint }}</p>
    </div>
</template>
