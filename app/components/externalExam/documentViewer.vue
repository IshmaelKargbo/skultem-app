<template>
  <UModal v-model:open="open" :title="title" :description="description" fullscreen>
    <template #body>
      <div class="flex h-full flex-col gap-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <UTabs v-model="type" :items="types" :content="false" size="sm" class="w-full sm:w-auto" />
          <div class="flex gap-2">
            <UButton icon="i-lucide-printer" label="Print" :disabled="!url" @click="print" />
            <UButton icon="i-lucide-download" variant="outline" color="neutral" label="Download" :disabled="!url"
              @click="save" />
          </div>
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
// Shows an exam result document as the PDF M-Compose made (so what you see is what prints), with Print and
// Download. candidateId empty = every candidate of the exam class in one PDF.
const props = defineProps<{ sittingId: string, candidateId?: string | null, candidateName?: string | null }>()
const open = defineModel<boolean>('open', { default: false })
const type = defineModel<ExamDocumentType>('type', { default: 'slip' })

const types = [
  { label: 'Result slip', value: 'slip' },
  { label: 'Statement of result', value: 'statement' }
]

const url = ref<string | null>(null)
const filename = ref('exam-result.pdf')
const loading = ref(false)
const failure = ref<string | null>(null)
const frame = ref<HTMLIFrameElement>()
let blob: Blob | null = null
let request = 0

const title = computed(() => props.candidateId
  ? `${props.candidateName || 'Candidate'}`
  : 'Every candidate')
const description = computed(() => props.candidateId
  ? 'Check the design and results, then print or download.'
  : 'One page per candidate, in name order - check them, then print or download.')

function clear() {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = null
  blob = null
}

async function load() {
  const mine = ++request
  clear()
  failure.value = null
  loading.value = true
  try {
    const api = ExternalExamApi()
    const res = props.candidateId
      ? await api.candidateDocument(props.sittingId, props.candidateId, type.value)
      : await api.allDocuments(props.sittingId, type.value)
    if (mine !== request) return
    blob = res.blob
    filename.value = res.filename
    url.value = URL.createObjectURL(res.blob)
  } catch (err: any) {
    if (mine === request) failure.value = err?.message || 'The document could not be made'
  } finally {
    if (mine === request) loading.value = false
  }
}

function print() {
  // The PDF is on this page's origin (a blob: URL), so its own viewer can print it.
  try {
    frame.value?.contentWindow?.focus()
    frame.value?.contentWindow?.print()
  } catch {
    if (url.value) window.open(url.value, '_blank')
  }
}

function save() {
  if (blob) downloadBlob(blob, filename.value)
}

watch([open, type, () => props.candidateId], ([isOpen]) => {
  if (isOpen) load()
  else clear()
})

onBeforeUnmount(clear)
</script>
