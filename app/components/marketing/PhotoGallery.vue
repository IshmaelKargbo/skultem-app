<script setup lang="ts">
// A set of photos for a post (up to max): upload several at a time, the first one is the cover, and
// the order can be changed.
const photos = defineModel<string[]>({ required: true })
const { max = 4 } = defineProps<{ max?: number }>()

const { error: toastError } = useNotify()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(0)
const dragging = ref(false)

async function addFiles(files: FileList | File[] | null) {
  const picked = Array.from(files ?? [])
  if (!picked.length) return

  const room = max - photos.value.length
  if (picked.length > room) toastError(`Only ${max} photos fit in a post - ${picked.length - room} were skipped`)

  const batch = picked.slice(0, Math.max(room, 0))
  const images = batch.filter(f => f.type.startsWith('image/'))
  if (images.length < batch.length) toastError('Only image files can be added')

  uploading.value += images.length
  // Uploaded together but kept in the order they were chosen.
  const urls = await Promise.all(images.map(async (file) => {
    try {
      return await MarketingApi().uploadPostImage(file)
    } catch (err: any) {
      toastError(`${file.name}: ${err.message}`)
      return null
    } finally {
      uploading.value--
    }
  }))
  photos.value = [...photos.value, ...urls.filter((u): u is string => !!u)]
}

function onPick(event: Event) {
  const el = event.target as HTMLInputElement
  addFiles(el.files)
  el.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  addFiles(event.dataTransfer?.files ?? null)
}

function remove(index: number) {
  photos.value = photos.value.filter((_, i) => i !== index)
}

function move(index: number, by: -1 | 1) {
  const to = index + by
  if (to < 0 || to >= photos.value.length) return
  const next = [...photos.value]
  const [item] = next.splice(index, 1)
  next.splice(to, 0, item!)
  photos.value = next
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm font-medium text-highlighted">Photos</p>
      <UBadge :color="photos.length >= max ? 'success' : 'neutral'" variant="subtle" size="sm">
        {{ photos.length }} of {{ max }}
      </UBadge>
    </div>

    <div v-if="photos.length || uploading" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div v-for="(url, i) in photos" :key="url"
        class="group relative aspect-4/3 overflow-hidden rounded-lg border border-default bg-muted/30">
        <img :src="url" alt="" class="size-full object-cover">

        <span v-if="i === 0"
          class="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-inverted">
          Cover
        </span>

        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
          <div class="flex gap-0.5">
            <UButton icon="i-lucide-arrow-left" size="xs" color="neutral" variant="ghost" class="text-white"
              :disabled="i === 0" aria-label="Move earlier" @click="move(i, -1)" />
            <UButton icon="i-lucide-arrow-right" size="xs" color="neutral" variant="ghost" class="text-white"
              :disabled="i === photos.length - 1" aria-label="Move later" @click="move(i, 1)" />
          </div>
          <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" aria-label="Remove photo"
            @click="remove(i)" />
        </div>
      </div>

      <div v-for="n in uploading" :key="`up-${n}`"
        class="flex aspect-4/3 items-center justify-center rounded-lg border border-dashed border-default bg-muted/30">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>
    </div>

    <button type="button"
      class="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/60'"
      :disabled="photos.length >= max" @click="input?.click()" @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false" @drop.prevent="onDrop">
      <UIcon name="i-lucide-image-plus" class="size-6 text-muted" />
      <span class="text-sm font-medium text-highlighted">
        {{ photos.length >= max ? `All ${max} photos added` : 'Add photos' }}
      </span>
      <span class="text-xs text-muted">
        <template v-if="photos.length >= max">Remove one to add a different photo.</template>
        <template v-else>
          Click or drop images here, up to {{ max }}. The first photo is the cover.
        </template>
      </span>
    </button>
    <input ref="input" type="file" accept="image/*" multiple class="hidden" @change="onPick">
  </div>
</template>
