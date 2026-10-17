<template>
  <UModal v-model:open="open" fullscreen :title="name || 'Photo'" description="Full size profile photo"
    :ui="{ content: 'bg-black/90', header: 'hidden' }">
    <template #content>
      <div class="relative flex h-full w-full items-center justify-center bg-black/90 p-4" @click="open = false">
        <div class="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 text-white">
          <p class="truncate text-sm font-medium">{{ name }}</p>
          <div class="flex items-center gap-2" @click.stop>
            <UButton v-if="src" :href="src" target="_blank" rel="noopener" download icon="i-lucide-download"
              color="neutral" variant="soft" size="sm" label="Open original" />
            <UButton icon="i-lucide-x" color="neutral" variant="soft" size="sm" aria-label="Close"
              @click="open = false" />
          </div>
        </div>
        <img v-if="src" :src="src" :alt="name" class="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          @click.stop>
        <div v-else class="flex flex-col items-center gap-2 text-white/80" @click.stop>
          <UIcon name="i-lucide-image-off" class="size-12" />
          <p class="text-sm">No photo uploaded yet.</p>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ src?: string | null, name?: string }>()
const open = defineModel<boolean>('open', { default: false })

onMounted(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') open.value = false }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})
</script>
