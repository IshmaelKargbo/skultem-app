<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useMarketingStore()
const { posts, postsMeta, loading } = storeToRefs(store)
const { success, error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const columns: TableColumn<BlogPost>[] = [
  { id: 'post', header: 'Post' },
  { id: 'tags', header: 'Tags' },
  { id: 'status', header: 'Status' },
  { accessorKey: 'updatedAt', header: 'Updated' },
  { id: 'actions', header: '' }
]

// Opens a saved post in the preview (the list leaves the body out, so the whole post is read first).
const previewPost = ref<BlogPost | null>(null)
const previewOpen = ref(false)

async function preview(p: BlogPost) {
  try {
    previewPost.value = await MarketingApi().getPost(p.id)
    previewOpen.value = true
  } catch (err: any) {
    toastError(err.message)
  }
}

async function togglePublished(p: BlogPost) {
  try {
    const full = await MarketingApi().getPost(p.id)
    await MarketingApi().updatePost(p.id, {
      title: full.title, slug: full.slug, excerpt: full.excerpt ?? '', content: full.content ?? '',
      images: full.images ?? [], authorName: full.authorName ?? '', tags: full.tags,
      published: !full.published
    })
    await store.fetchPosts(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
  }
}

const deleteTarget = ref<BlogPost | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await MarketingApi().deletePost(deleteTarget.value.id)
    success('Post deleted')
    await store.fetchPosts(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

function rowActions(p: BlogPost) {
  return [[
    { label: 'Preview', icon: 'i-lucide-eye', onSelect: () => preview(p) },
    { label: 'Edit', icon: 'i-lucide-pencil', to: `/blog/${p.id}` },
    {
      label: p.published ? 'Unpublish' : 'Publish', icon: p.published ? 'i-lucide-eye-off' : 'i-lucide-eye',
      onSelect: () => togglePublished(p)
    }
  ], [
    {
      label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const,
      onSelect: () => { deleteTarget.value = p; deleteOpen.value = true }
    }
  ]]
}

watch(page, () => store.fetchPosts(page.value, 10))

onMounted(() => {
  useAppStore().setTitle('System Admin · Blog')
  useAppStore().setBack(false)
  document.title = 'Blog | System Admin | Skultem'
  store.fetchPosts(page.value, 10)
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Blog" subtitle="Articles shown on the marketing site. Drafts stay hidden until published.">
      <UButton icon="i-lucide-plus" label="New Post" to="/blog/add" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="posts" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-newspaper" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No blog posts yet.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #post-cell="{ row }">
          <div class="flex items-center gap-3">
            <img v-if="row.original.coverImageUrl" :src="row.original.coverImageUrl" alt=""
              class="h-12 w-16 shrink-0 rounded-md object-cover">
            <div class="min-w-0">
              <NuxtLink :to="`/blog/${row.original.id}`" class="block truncate font-medium text-highlighted hover:text-primary">{{ row.original.title }}</NuxtLink>
              <p class="truncate text-xs text-muted">/{{ row.original.slug }}</p>
              <p v-if="row.original.excerpt" class="max-w-md truncate text-xs text-muted">{{ row.original.excerpt }}</p>
              <p class="text-xs text-muted">{{ row.original.images.length }} photo{{ row.original.images.length === 1 ? '' : 's' }}</p>
            </div>
          </div>
        </template>

        <template #tags-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="tag in row.original.tags" :key="tag" size="sm" variant="outline" color="neutral" :label="tag" />
            <span v-if="!row.original.tags.length" class="text-xs text-muted">—</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="row.original.published ? 'success' : 'neutral'">
            {{ row.original.published ? 'Published' : 'Draft' }}
          </UBadge>
        </template>

        <template #updatedAt-cell="{ row }">
          <p class="text-xs text-muted">{{ formatDateTime(row.original.updatedAt) }}</p>
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
          <Showing :meta="postsMeta" />
          <UPagination v-model:page="page" size="sm" :page-size="postsMeta.size" :items-per-page="postsMeta.size"
            :total="postsMeta.total" show-edges />
        </div>
      </template>
    </UCard>

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Post"
      :item-name="deleteTarget.title" :on-confirm="confirmDelete"
      description="This removes the post from the marketing site." />

    <MarketingBlogPreview v-model:open="previewOpen" :post="previewPost" />
  </div>
</template>
