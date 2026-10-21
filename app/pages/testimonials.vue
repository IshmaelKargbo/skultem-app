<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useMarketingStore()
const { testimonials, testimonialsMeta, loading } = storeToRefs(store)
const { success, error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const columns: TableColumn<Testimonial>[] = [
  { id: 'author', header: 'Author' },
  { accessorKey: 'quote', header: 'Testimonial' },
  { accessorKey: 'rating', header: 'Rating' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

const emptyForm = (): SaveTestimonialDto => ({
  authorName: '', authorRole: '', schoolName: '', quote: '', rating: 5,
  photoUrl: '', featured: false, published: true, displayOrder: 0
})

const open = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<SaveTestimonialDto>(emptyForm())
const saving = ref(false)

function startCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  open.value = true
}

function startEdit(t: Testimonial) {
  editingId.value = t.id
  Object.assign(form, {
    authorName: t.authorName, authorRole: t.authorRole ?? '', schoolName: t.schoolName ?? '', quote: t.quote,
    rating: t.rating, photoUrl: t.photoUrl ?? '', featured: t.featured, published: t.published,
    displayOrder: t.displayOrder
  })
  open.value = true
}

async function save() {
  if (!form.authorName.trim() || !form.quote.trim()) {
    toastError('Author name and the testimonial are required')
    return
  }

  saving.value = true
  try {
    if (editingId.value) await MarketingApi().updateTestimonial(editingId.value, { ...form })
    else await MarketingApi().createTestimonial({ ...form })
    success(editingId.value ? 'Testimonial updated' : 'Testimonial added')
    open.value = false
    await store.fetchTestimonials(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

async function togglePublished(t: Testimonial) {
  try {
    await MarketingApi().updateTestimonial(t.id, {
      authorName: t.authorName, authorRole: t.authorRole ?? '', schoolName: t.schoolName ?? '', quote: t.quote,
      rating: t.rating, photoUrl: t.photoUrl ?? '', featured: t.featured, published: !t.published,
      displayOrder: t.displayOrder
    })
    await store.fetchTestimonials(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
  }
}

const deleteTarget = ref<Testimonial | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await MarketingApi().deleteTestimonial(deleteTarget.value.id)
    success('Testimonial deleted')
    await store.fetchTestimonials(page.value, 10)
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

function rowActions(t: Testimonial) {
  return [[
    { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => startEdit(t) },
    {
      label: t.published ? 'Unpublish' : 'Publish', icon: t.published ? 'i-lucide-eye-off' : 'i-lucide-eye',
      onSelect: () => togglePublished(t)
    }
  ], [
    {
      label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const,
      onSelect: () => { deleteTarget.value = t; deleteOpen.value = true }
    }
  ]]
}

watch(page, () => store.fetchTestimonials(page.value, 10))

onMounted(() => {
  useAppStore().setTitle('System Admin · Testimonials')
  useAppStore().setBack(false)
  document.title = 'Testimonials | System Admin | Skultem'
  store.fetchTestimonials(page.value, 10)
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Testimonials" subtitle="What schools say about Skultem, shown on the marketing site.">
      <UButton icon="i-lucide-plus" label="Add Testimonial" @click="startCreate" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="testimonials" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-quote" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No testimonials yet.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #author-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :src="row.original.photoUrl || undefined" :alt="row.original.authorName" size="md" />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ row.original.authorName }}</p>
              <p class="truncate text-xs text-muted">
                {{ [row.original.authorRole, row.original.schoolName].filter(Boolean).join(' · ') || '—' }}
              </p>
            </div>
          </div>
        </template>

        <template #quote-cell="{ row }">
          <p class="max-w-md line-clamp-2 text-sm text-muted" :title="row.original.quote">“{{ row.original.quote }}”</p>
        </template>

        <template #rating-cell="{ row }">
          <span class="flex items-center gap-1 text-sm">
            <UIcon name="i-lucide-star" class="size-4 text-warning" /> {{ row.original.rating }}
          </span>
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
          <Showing :meta="testimonialsMeta" />
          <UPagination v-model:page="page" size="sm" :page-size="testimonialsMeta.size"
            :items-per-page="testimonialsMeta.size" :total="testimonialsMeta.total" show-edges />
        </div>
      </template>
    </UCard>

    <USlideover v-model:open="open" :title="editingId ? 'Edit Testimonial' : 'Add Testimonial'">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="save">
          <UFormField label="Author name" required>
            <UInput v-model="form.authorName" placeholder="e.g. Aminata Kamara" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Role">
              <UInput v-model="form.authorRole" placeholder="e.g. Head Teacher" class="w-full" />
            </UFormField>
            <UFormField label="School">
              <UInput v-model="form.schoolName" placeholder="e.g. Bright Future Academy" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Testimonial" required>
            <UTextarea v-model="form.quote" :rows="5" autoresize maxlength="2000" class="w-full"
              placeholder="What they said about Skultem" />
          </UFormField>
          <UFormField label="Photo URL" help="Optional link to a picture of the author.">
            <UInput v-model="form.photoUrl" placeholder="https://..." class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Rating">
              <USelect v-model="form.rating" :items="[5, 4, 3, 2, 1].map(n => ({ label: `${n} star${n === 1 ? '' : 's'}`, value: n }))"
                class="w-full" />
            </UFormField>
            <UFormField label="Display order" help="Lower numbers come first.">
              <UInput v-model.number="form.displayOrder" type="number" class="w-full" />
            </UFormField>
          </div>
          <USwitch v-model="form.published" label="Published on the marketing site" />
          <USwitch v-model="form.featured" label="Featured (shown first)" />
        </UForm>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton icon="i-lucide-save" label="Save" :loading="saving" @click="save" />
          <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="open = false" />
        </div>
      </template>
    </USlideover>

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Testimonial"
      :item-name="deleteTarget.authorName" :on-confirm="confirmDelete"
      description="This removes the testimonial from the marketing site." />
  </div>
</template>
