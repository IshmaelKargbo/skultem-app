<script setup lang="ts">
// Adding, renaming, ordering and removing blog categories. Removing one keeps its posts, uncategorised.
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ changed: [] }>()

const { success, error: toastError } = useNotify()

const categories = ref<BlogCategory[]>([])
const loading = ref(false)
const saving = ref(false)

// The category being edited; null with the form shown = a new one.
const editing = ref<BlogCategory | null>(null)
const formOpen = ref(false)
const form = reactive<SaveBlogCategoryDto>({ name: '', slug: '', description: '', displayOrder: 0 })
const showErrors = ref(false)

const errors = computed(() => ({
  name: !form.name.trim() ? 'Name is required' : form.name.length > 80 ? 'Keep the name under 80 characters' : '',
  slug: form.slug.trim() && !isValidSlug(form.slug.trim())
    ? 'Use lowercase letters, numbers and single hyphens only, e.g. school-fees' : '',
  description: form.description.length > 500 ? 'Keep the description under 500 characters' : ''
}))
const shown = (field: keyof typeof errors.value) => (showErrors.value && errors.value[field]) || undefined

async function load() {
  loading.value = true
  try {
    categories.value = (await MarketingApi().listCategories()) || []
  } finally {
    loading.value = false
  }
}

function startNew() {
  editing.value = null
  Object.assign(form, { name: '', slug: '', description: '', displayOrder: categories.value.length })
  showErrors.value = false
  formOpen.value = true
}

function startEdit(c: BlogCategory) {
  editing.value = c
  Object.assign(form, { name: c.name, slug: c.slug, description: c.description ?? '', displayOrder: c.displayOrder })
  showErrors.value = false
  formOpen.value = true
}

async function save() {
  showErrors.value = true
  const first = Object.values(errors.value).find(Boolean)
  if (first) {
    toastError(first)
    return
  }
  saving.value = true
  try {
    const dto = { ...form, name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() }
    if (editing.value) await MarketingApi().updateCategory(editing.value.id, dto)
    else await MarketingApi().createCategory(dto)
    success(editing.value ? 'Category updated' : 'Category added')
    formOpen.value = false
    await load()
    emit('changed')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

// Moves a category up or down the list (the order the marketing site shows them in).
async function move(index: number, by: -1 | 1) {
  const list = [...categories.value]
  const other = index + by
  if (other < 0 || other >= list.length) return
  ;[list[index], list[other]] = [list[other]!, list[index]!]
  categories.value = list
  try {
    await Promise.all(list.map((c, i) => c.displayOrder === i ? null
      : MarketingApi().updateCategory(c.id, { name: c.name, slug: c.slug, description: c.description ?? '', displayOrder: i })))
    await load()
    emit('changed')
  } catch (err: any) {
    toastError(err.message)
    await load()
  }
}

const deleteTarget = ref<BlogCategory | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await MarketingApi().deleteCategory(deleteTarget.value.id)
    success('Category deleted')
    await load()
    emit('changed')
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

watch(open, (v) => {
  if (v) {
    formOpen.value = false
    load()
  }
})
</script>

<template>
  <USlideover v-model:open="open" title="Blog categories"
    description="Group posts so readers can browse by topic. A post sits in one category.">
    <template #body>
      <div class="space-y-4">
        <UCard v-if="formOpen">
          <div class="space-y-4">
            <p class="font-semibold">{{ editing ? 'Edit category' : 'New category' }}</p>
            <UFormField label="Name" required :error="shown('name')">
              <UInput v-model="form.name" class="w-full" placeholder="e.g. School fees" autofocus />
            </UFormField>
            <UFormField label="Slug" :error="shown('slug')"
              :help="form.slug ? undefined : 'Its web address. Left blank, it is made from the name.'">
              <UInput v-model="form.slug" class="w-full" :placeholder="slugFromTitle(form.name) || 'school-fees'" />
            </UFormField>
            <UFormField label="Description" hint="Optional" :error="shown('description')">
              <UTextarea v-model="form.description" :rows="2" autoresize maxlength="500" class="w-full"
                placeholder="Shown at the top of the category's page" />
            </UFormField>
            <div class="flex gap-2">
              <UButton :icon="SAVE_ICON" :label="editing ? 'Save' : 'Add category'" :loading="saving" @click="save" />
              <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="formOpen = false" />
            </div>
          </div>
        </UCard>
        <UButton v-else icon="i-lucide-plus" label="New category" block @click="startNew" />

        <div v-if="loading && !categories.length" class="space-y-2">
          <USkeleton v-for="i in 3" :key="i" class="h-14 w-full rounded-lg" />
        </div>

        <div v-else-if="!categories.length" class="flex flex-col items-center gap-2 py-10 text-center">
          <UIcon name="i-lucide-folder-open" class="text-4xl text-gray-400" />
          <p class="text-sm text-muted">No categories yet. Add one to start grouping posts.</p>
        </div>

        <ul v-else class="divide-y divide-default rounded-lg border border-default">
          <li v-for="(c, i) in categories" :key="c.id" class="flex items-center gap-3 p-3">
            <div class="flex flex-col">
              <UButton icon="i-lucide-chevron-up" size="xs" variant="ghost" color="neutral" :disabled="i === 0"
                aria-label="Move up" @click="move(i, -1)" />
              <UButton icon="i-lucide-chevron-down" size="xs" variant="ghost" color="neutral"
                :disabled="i === categories.length - 1" aria-label="Move down" @click="move(i, 1)" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-highlighted">{{ c.name }}</p>
              <p class="truncate text-xs text-muted">/blog?category={{ c.slug }}</p>
              <p class="text-xs text-muted">
                {{ c.postCount }} post{{ c.postCount === 1 ? '' : 's' }} · {{ c.publishedCount }} published
              </p>
            </div>
            <UButton :icon="EDIT_ICON" size="xs" variant="ghost" color="neutral" aria-label="Edit" @click="startEdit(c)" />
            <UButton :icon="DELETE_ICON" size="xs" variant="ghost" color="error" aria-label="Delete"
              @click="deleteTarget = c; deleteOpen = true" />
          </li>
        </ul>
      </div>

      <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Category"
        :item-name="deleteTarget.name" :on-confirm="confirmDelete"
        :description="deleteTarget.postCount ? `Its ${deleteTarget.postCount} post${deleteTarget.postCount === 1 ? '' : 's'} will stay, without a category.` : 'No posts are in this category.'" />
    </template>
  </USlideover>
</template>
