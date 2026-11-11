<template>
  <UModal v-model:open="open" :title="title" :description="description" fullscreen>
    <template #body>
      <div class="flex h-full flex-col gap-3">
        <div class="flex justify-end gap-2">
          <UButton icon="i-lucide-printer" label="Print" :disabled="!url" @click="print" />
          <UButton icon="i-lucide-download" variant="outline" color="neutral" label="Download" :disabled="!url"
            @click="save" />
        </div>
        <div class="relative min-h-[60vh] flex-1 overflow-hidden rounded-lg border border-default bg-elevated">
          <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
            Making the document…
          </div>
          <div v-else-if="failure" class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <UIcon name="i-lucide-file-x" class="size-8 text-error" />
            <p class="text-sm text-highlighted">{{ failure }}</p>
            <UButton size="sm" variant="soft" label="Try again" @click="load" />
          </div>
          <iframe v-else-if="url" ref="frame" :src="url" :title="title" class="size-full min-h-[60vh] bg-white" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
// Shows a PDF made by the document service (M-Compose) inside the page, exactly as it prints, with Print and
// Download. fetcher makes the PDF; it is asked each time the viewer opens.
const props = defineProps<{
  title: string
  description?: string
  fetcher: () => Promise<{ blob: Blob, filename: string }>
}>()
const emit = defineEmits<{ printed: [], saved: [] }>()
const open = defineModel<boolean>('open', { default: false })

const url = ref<string | null>(null)
const filename = ref('document.pdf')
const loading = ref(false)
const failure = ref<string | null>(null)
const frame = ref<HTMLIFrameElement>()
let blob: Blob | null = null

function clear() {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = null
  blob = null
}

async function load() {
  clear()
  failure.value = null
  loading.value = true
  try {
    const res = await props.fetcher()
    blob = res.blob
    filename.value = res.filename
    url.value = URL.createObjectURL(res.blob)
  } catch (err: any) {
    failure.value = err?.message || 'The document could not be made'
  } finally {
    loading.value = false
  }
}

function print() {
  try {
    frame.value?.contentWindow?.focus()
    frame.value?.contentWindow?.print()
  } catch {
    if (url.value) window.open(url.value, '_blank')
  }
  emit('printed')
}

function save() {
  if (!blob) return
  downloadBlob(blob, filename.value)
  emit('saved')
}

watch(open, (isOpen) => {
  if (isOpen) load()
  else clear()
})

onBeforeUnmount(clear)
</script>
