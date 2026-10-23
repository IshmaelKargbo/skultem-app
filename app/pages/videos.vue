<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

// YouTube videos for the marketing site - which it reads from GET /api/v1/public/videos instead of hardcoding them.
const route = useRoute()
const router = useRouter()
const store = useMarketingStore()
const { videos, videosMeta, loading } = storeToRefs(store)
const { success, error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const columns: TableColumn<MarketingVideo>[] = [
  { id: 'video', header: 'Video' },
  { accessorKey: 'displayOrder', header: 'Order' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

const emptyForm = (): SaveMarketingVideoDto => ({
  title: '', description: '', youtubeUrl: '', featured: false, published: true, displayOrder: 0
})

const open = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<SaveMarketingVideoDto>(emptyForm())
const saving = ref(false)

// Live preview of the pasted link - the thumbnail shows as soon as it's a real YouTube video link.
const previewId = computed(() => youtubeIdOf(form.youtubeUrl))

const toDto = (v: MarketingVideo, overrides: Partial<SaveMarketingVideoDto> = {}): SaveMarketingVideoDto => ({
  title: v.title, description: v.description ?? '', youtubeUrl: v.watchUrl, featured: v.featured,
  published: v.published, displayOrder: v.displayOrder, ...overrides
})

function startCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  open.value = true
}

function startEdit(v: MarketingVideo) {
  editingId.value = v.id
  Object.assign(form, toDto(v))
  open.value = true
}

async function save() {
  if (!form.title.trim()) {
    toastError('A title is required')
    return
  }
  if (!previewId.value) {
    toastError('Paste a YouTube video link, e.g. https://www.youtube.com/watch?v=...')
    return
  }

  saving.value = true
  try {
    if (editingId.value) await MarketingApi().updateVideo(editingId.value, { ...form })
    else await MarketingApi().createVideo({ ...form })
    success(editingId.value ? 'Video updated' : 'Video added')
    open.value = false
    await store.fetchVideos(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

async function togglePublished(v: MarketingVideo) {
  try {
    await MarketingApi().updateVideo(v.id, toDto(v, { published: !v.published }))
    await store.fetchVideos(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
  }
}

const deleteTarget = ref<MarketingVideo | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await MarketingApi().deleteVideo(deleteTarget.value.id)
    success('Video deleted')
    await store.fetchVideos(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

function rowActions(v: MarketingVideo) {
  return [[
    { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => startEdit(v) },
    { label: 'Watch on YouTube', icon: 'i-lucide-external-link', onSelect: () => window.open(v.watchUrl, '_blank', 'noopener') },
    {
      label: v.published ? 'Unpublish' : 'Publish', icon: v.published ? 'i-lucide-eye-off' : 'i-lucide-eye',
      onSelect: () => togglePublished(v)
    }
  ], [
    {
      label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const,
      onSelect: () => { deleteTarget.value = v; deleteOpen.value = true }
    }
  ]]
}

function closeForm() {
  open.value = false
}

watch(page, () => store.fetchVideos(page.value, 10))

onMounted(() => {
  useAppStore().setTitle('System Admin · Videos')
  useAppStore().setBack(false)
  document.title = 'Videos | System Admin | Skultem'
  store.fetchVideos(page.value, 10)
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Videos" subtitle="YouTube videos shown on the marketing site.">
      <UButton icon="i-lucide-plus" label="Add Video" @click="startCreate" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="videos" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-youtube" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No videos yet.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #video-cell="{ row }">
          <div class="flex items-center gap-3">
            <a :href="row.original.watchUrl" target="_blank" rel="noopener noreferrer"
              class="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-elevated">
              <img :src="row.original.thumbnailUrl" :alt="row.original.title" loading="lazy"
                class="size-full object-cover">
              <span class="absolute inset-0 flex items-center justify-center bg-black/20">
                <UIcon name="i-lucide-play" class="size-5 text-white" />
              </span>
            </a>
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ row.original.title }}</p>
              <p class="max-w-md line-clamp-1 text-xs text-muted">{{ row.original.description || row.original.watchUrl }}</p>
            </div>
          </div>
        </template>

        <template #status-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge size="sm" variant="subtle" :color="row.original.published ? 'success' : 'neutral'">
              {{ row.original.published ? 'Published' : 'Draft' }}
            </UBadge>
            <UBadge v-if="row.original.featured" size="sm" variant="subtle" color="primary">Featured</UBadge>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
            </UDropdownMenu>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="videosMeta" />
          <UPagination v-model:page="page" size="sm" :page-size="videosMeta.size"
            :items-per-page="videosMeta.size" :total="videosMeta.total" show-edges />
        </div>
      </template>
    </UCard>

    <USlideover v-model:open="open" :title="editingId ? 'Edit Video' : 'Add Video'">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="save">
          <UFormField label="YouTube link" required
            help="Paste the video's link - from the address bar or YouTube's Share button.">
            <UInput v-model="form.youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." icon="i-lucide-link"
              class="w-full" />
          </UFormField>
          <div class="aspect-video w-full overflow-hidden rounded-lg border border-default bg-elevated">
            <img v-if="previewId" :src="`https://i.ytimg.com/vi/${previewId}/hqdefault.jpg`" alt="Video preview"
              class="size-full object-cover">
            <div v-else class="flex size-full flex-col items-center justify-center gap-1 text-center text-muted">
              <UIcon name="i-lucide-youtube" class="size-8" />
              <p class="text-xs">{{ form.youtubeUrl ? 'Not a YouTube video link yet' : 'The preview shows here' }}</p>
            </div>
          </div>
          <UFormField label="Title" required>
            <UInput v-model="form.title" maxlength="255" placeholder="e.g. How Skultem handles report cards"
              class="w-full" />
          </UFormField>
          <UFormField label="Description" help="Optional - a line or two shown with the video.">
            <UTextarea v-model="form.description" :rows="3" autoresize maxlength="1000" class="w-full" />
          </UFormField>
          <UFormField label="Display order" help="Lower numbers come first.">
            <UInput v-model.number="form.displayOrder" type="number" class="w-full" />
          </UFormField>
          <USwitch v-model="form.published" label="Published on the marketing site" />
          <USwitch v-model="form.featured" label="Featured (shown first)" />
        </UForm>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton icon="i-lucide-save" label="Save" :loading="saving" @click="save" />
          <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="closeForm" />
        </div>
      </template>
    </USlideover>

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Video"
      :item-name="deleteTarget.title" :on-confirm="confirmDelete"
      description="This removes the video from the marketing site." />
  </div>
</template>
