<script lang="ts" setup>
// inherited: `src` is a default coming from somewhere else (e.g. the school's logo shown on a
// section that hasn't set its own) - shown faded with a badge and no remove button, and "Override"
// instead of "Replace".
const { label, hint, src, muted, inherited } = defineProps<{
    label: string
    hint?: string
    src?: string
    muted?: boolean
    inherited?: boolean
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
            <img v-if="src" :src="src" :alt="label" class="h-full w-full object-contain p-2"
                :class="inherited ? 'opacity-60' : ''">
            <UIcon v-else name="lucide:image-plus" class="text-2xl text-muted" />

            <span v-if="src && inherited"
                class="absolute bottom-1 left-1 rounded-full bg-elevated px-2 py-0.5 text-[10px] font-medium text-toned shadow">
                School default
            </span>

            <button v-if="src && !inherited" type="button" title="Remove" 
                class="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-error text-inverted shadow"
                @click="emit('clear')">
                <UIcon name="lucide:x" class="size-3" />
            </button>
        </div>

        <UButton block size="xs" variant="soft" :label="src && !inherited ? 'Replace' : inherited ? 'Override' : 'Browse'" icon="lucide:upload" @click="trigger" />
        <input ref="input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon" class="hidden"
            @change="onChange">
        <p v-if="hint" class="text-center text-[11px] text-muted">{{ hint }}</p>
    </div>
</template>
