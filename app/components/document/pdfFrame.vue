<template>
  <div class="flex flex-col gap-2">
    <div v-if="toolbar" class="flex items-center justify-between gap-2">
      <p class="truncate text-xs text-muted">{{ caption }}</p>
      <div class="flex gap-1">
        <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" aria-label="Refresh preview"
          :loading="loading" @click="load" />
        <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-printer" aria-label="Print" :disabled="!url"
          @click="print" />
        <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-download" aria-label="Download"
          :disabled="!url" @click="save" />
      </div>
    </div>
    <div class="relative overflow-hidden rounded-lg border border-default bg-elevated" :style="{ height }">
      <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        Making the document…
      </div>
      <div v-else-if="failure" class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <UIcon name="i-lucide-file-x" class="size-8 text-error" />
        <p class="text-sm text-highlighted">{{ failure }}</p>
        <UButton size="sm" variant="soft" label="Try again" @click="load" />
      </div>
      <iframe v-else-if="url" ref="frame" :src="`${url}#toolbar=0&view=FitH`" :title="caption"
        class="size-full bg-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
// A PDF made by the document service (M-Compose), shown in the page exactly as it prints, with Refresh, Print and
// Download. Changing reloadKey makes it fetch again (e.g. after a different design is picked).
const props = withDefaults(defineProps<{
  fetcher: () => Promise<{ blob: Blob, filename: string }>
  caption?: string
  height?: string
  toolbar?: boolean
  reloadKey?: string | number
}>(), {
  caption: 'As it prints',
  height: '70vh',
  toolbar: true,
  reloadKey: 0
})
const emit = defineEmits<{ printed: [], saved: [] }>()

const url = ref<string | null>(null)
const filename = ref('document.pdf')
const loading = ref(false)
const failure = ref<string | null>(null)
const frame = ref<HTMLIFrameElement>()
let blob: Blob | null = null

async function load() {
  loading.value = true
  failure.value = null
  try {
    const res = await props.fetcher()
    if (url.value) URL.revokeObjectURL(url.value)
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

watch(() => props.reloadKey, load)
onMounted(load)
onBeforeUnmount(() => {
  if (url.value) URL.revokeObjectURL(url.value)
})
defineExpose({ load })
</script>
