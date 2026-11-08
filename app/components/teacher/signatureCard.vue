<!-- A teacher's own signature: draw it with a finger or mouse, or upload a photo of it. It prints on the report
     cards they approve as class teacher. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 class="text-lg font-semibold">My Signature</h3>
          <p class="text-sm text-muted">Printed on the report cards you approve as class teacher.</p>
        </div>
        <UBadge v-if="current" color="success" variant="subtle" icon="i-lucide-circle-check" label="Saved" />
        <UBadge v-else-if="!loading" color="warning" variant="subtle" icon="i-lucide-pen-line" label="Not added yet" />
      </div>
    </template>

    <USkeleton v-if="loading" class="h-32 w-full rounded-xl" />

    <div v-else class="space-y-4">
      <!-- What's saved now -->
      <div v-if="current && !editing" class="space-y-3">
        <div class="flex h-32 items-center justify-center rounded-xl border border-dashed border-default bg-white">
          <img :src="current" alt="Your signature" class="max-h-28 max-w-full object-contain">
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-pencil" variant="soft" label="Change" @click="startEditing" />
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" label="Remove" :loading="removing" @click="remove" />
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 gap-1 rounded-lg bg-elevated p-1 sm:w-64">
          <UButton v-for="m in modes" :key="m.value" size="sm" block :icon="m.icon" :label="m.label"
            :color="mode === m.value ? 'primary' : 'neutral'" :variant="mode === m.value ? 'solid' : 'ghost'"
            @click="() => { mode = m.value }" />
        </div>

        <!-- Draw -->
        <div v-show="mode === 'draw'" class="space-y-2">
          <div ref="padWrap" class="relative h-40 overflow-hidden rounded-xl border border-default bg-white">
            <canvas ref="canvas" class="h-full w-full touch-none" @pointerdown="startStroke" @pointermove="moveStroke"
              @pointerup="endStroke" @pointerleave="endStroke" @pointercancel="endStroke" />
            <p v-if="!hasInk" class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              Sign here with your finger or mouse
            </p>
            <div class="pointer-events-none absolute inset-x-6 bottom-8 border-b border-gray-300" />
          </div>
          <UButton size="xs" variant="link" color="neutral" icon="i-lucide-eraser" label="Clear" class="px-0"
            :disabled="!hasInk" @click="clearPad" />
        </div>

        <!-- Upload -->
        <div v-show="mode === 'upload'" class="space-y-2">
          <label class="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-default bg-white text-sm text-muted hover:border-primary">
            <img v-if="uploadPreview" :src="uploadPreview" alt="" class="max-h-28 max-w-full object-contain">
            <template v-else>
              <UIcon name="i-lucide-image-up" class="size-6" />
              <span>Choose a photo of your signature</span>
              <span class="text-xs">Sign on white paper with a dark pen. PNG or JPG, under 2 MB.</span>
            </template>
            <input type="file" accept="image/png,image/jpeg" class="hidden" @change="pickFile">
          </label>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-save" label="Save signature" :loading="saving" :disabled="!canSave" @click="save" />
          <UButton v-if="current" variant="outline" color="neutral" label="Cancel" :disabled="saving"
            @click="() => { editing = false }" />
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { success, error: toastError } = useNotify()

const loading = ref(true)
const saving = ref(false)
const removing = ref(false)
const current = ref<string | null>(null)
const editing = ref(false)
const mode = ref<'draw' | 'upload'>('draw')
const modes = [
  { value: 'draw', label: 'Draw', icon: 'i-lucide-pen-line' },
  { value: 'upload', label: 'Upload', icon: 'i-lucide-upload' },
] as const

// ---- drawing
const canvas = ref<HTMLCanvasElement | null>(null)
const padWrap = ref<HTMLElement | null>(null)
const hasInk = ref(false)
let drawing = false
let last: { x: number, y: number } | null = null

function setupCanvas() {
  const c = canvas.value
  const wrap = padWrap.value
  if (!c || !wrap) return
  const ratio = window.devicePixelRatio || 1
  c.width = wrap.clientWidth * ratio
  c.height = wrap.clientHeight * ratio
  const ctx = c.getContext('2d')!
  ctx.scale(ratio, ratio)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 2.4
  ctx.strokeStyle = '#111827'
  hasInk.value = false
}

function point(e: PointerEvent) {
  const r = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function startStroke(e: PointerEvent) {
  drawing = true
  last = point(e)
  canvas.value?.setPointerCapture(e.pointerId)
}

function moveStroke(e: PointerEvent) {
  if (!drawing || !last || !canvas.value) return
  const p = point(e)
  const ctx = canvas.value.getContext('2d')!
  ctx.beginPath()
  ctx.moveTo(last.x, last.y)
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  last = p
  hasInk.value = true
}

function endStroke() {
  drawing = false
  last = null
}

function clearPad() {
  setupCanvas()
}

// ---- upload
const uploadFile = ref<File | null>(null)
const uploadPreview = ref<string | null>(null)

function pickFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    toastError('That image is too large - keep it under 2 MB')
    return
  }
  uploadFile.value = file
  uploadPreview.value = URL.createObjectURL(file)
}

const canSave = computed(() => (mode.value === 'draw' ? hasInk.value : !!uploadFile.value))

function canvasBlob(): Promise<Blob | null> {
  return new Promise(resolve => canvas.value ? canvas.value.toBlob(b => resolve(b), 'image/png') : resolve(null))
}

async function save() {
  saving.value = true
  try {
    const image = mode.value === 'draw' ? await canvasBlob() : uploadFile.value
    if (!image) return
    const filename = mode.value === 'draw' ? 'signature.png' : (uploadFile.value?.name || 'signature.png')
    const url = await TeacherApi().saveMySignature(image, filename)
    if (url === undefined) return
    current.value = url
    editing.value = false
    success('Signature saved - it will print on the report cards you approve')
  } catch (err: any) {
    toastError(err?.message || 'Could not save your signature')
  } finally {
    saving.value = false
  }
}

async function remove() {
  removing.value = true
  try {
    await TeacherApi().removeMySignature()
    current.value = null
    await nextTick()
    setupCanvas()
    success('Signature removed')
  } catch (err: any) {
    toastError(err?.message || 'Could not remove your signature')
  } finally {
    removing.value = false
  }
}

async function startEditing() {
  editing.value = true
  await nextTick()
  setupCanvas()
}

onMounted(async () => {
  try {
    current.value = (await TeacherApi().getMySignature()) ?? null
  } catch {
    current.value = null
  } finally {
    loading.value = false
    await nextTick()
    setupCanvas()
  }
})
</script>
