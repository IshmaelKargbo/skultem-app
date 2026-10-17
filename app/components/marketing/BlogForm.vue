<script setup lang="ts">
// One blog post's page: creating a new one (no id) or editing an existing one. Both pages render this.
const { id } = defineProps<{ id?: string }>()

const router = useRouter()
const { success, error: toastError } = useNotify()

type Form = Omit<SaveBlogPostDto, 'tags'> & { tags: string }

const form = reactive<Form>({
  title: '', slug: '', excerpt: '', content: '', images: [], authorName: '', tags: '', published: false
})

const previewOpen = ref(false)
const loading = ref(!!id)
const saving = ref(false)
const notFound = ref(false)

const payload = (): SaveBlogPostDto => ({
  ...form,
  tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const isBlankHtml = (html: string) => !html.replace(/<[^>]*>/g, '').trim() && !/<(img|hr)\b/i.test(html)

// The formatting buttons above the writing area.
const toolbarItems = [
  [{ kind: 'undo', icon: 'i-lucide-undo' }, { kind: 'redo', icon: 'i-lucide-redo' }],
  [
    { icon: 'i-lucide-heading', tooltip: { text: 'Headings' }, content: { align: 'start' as const }, items: [
      { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Heading 2' },
      { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Heading 3' },
      { kind: 'paragraph', icon: 'i-lucide-pilcrow', label: 'Paragraph' }
    ] }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Bulleted list' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Numbered list' } },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Quote' } },
    { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: 'Divider' } }
  ],
  [
    { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
    { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
    { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right' }
  ],
  [{ kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }],
  [{ kind: 'clearFormatting', icon: 'i-lucide-remove-formatting', tooltip: { text: 'Clear formatting' } }]
]

async function load() {
  if (!id) return
  try {
    const post = await MarketingApi().getPost(id)
    Object.assign(form, {
      title: post.title, slug: post.slug, excerpt: post.excerpt ?? '', content: post.content ?? '',
      images: post.images ?? [], authorName: post.authorName ?? '', tags: post.tags.join(', '),
      published: post.published
    })
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

// ---- Slug: checked as it is typed, and again by the server on save ----
const slugTaken = ref(false)
const slugChecking = ref(false)
let slugTimer: ReturnType<typeof setTimeout>
let slugRequest = 0

const slugText = computed(() => form.slug.trim())
const slugFormatError = computed(() => {
  if (!slugText.value) return ''
  if (slugText.value.length > SLUG_MAX_LENGTH) return `Keep it under ${SLUG_MAX_LENGTH} characters`
  if (!isValidSlug(slugText.value)) return 'Use lowercase letters, numbers and single hyphens only, e.g. my-first-post'
  return ''
})
const slugError = computed(() => slugFormatError.value || (slugTaken.value ? 'Another post already uses this slug' : ''))
// What the address will be when the slug is left blank.
const slugPreview = computed(() => slugFromTitle(form.title))

watch(slugText, (slug) => {
  clearTimeout(slugTimer)
  slugTaken.value = false
  if (!slug || slugFormatError.value) return

  slugChecking.value = true
  slugTimer = setTimeout(async () => {
    const id_ = ++slugRequest
    const free = await MarketingApi().slugAvailable(slug, id)
    if (id_ !== slugRequest) return
    slugTaken.value = !free
    slugChecking.value = false
  }, 400)
})
onBeforeUnmount(() => clearTimeout(slugTimer))

// ---- Validation: every field is checked as it changes, and shown once a save has been tried ----
const showErrors = ref(false)
const tagList = computed(() => form.tags.split(',').map(t => t.trim()).filter(Boolean))

const errors = computed(() => ({
  title: !form.title.trim() ? 'Title is required' : form.title.length > 255 ? 'Keep the title under 255 characters' : '',
  excerpt: form.excerpt.length > 1000 ? 'Keep the excerpt under 1000 characters' : '',
  content: isBlankHtml(form.content) ? 'Write the post before saving' : '',
  slug: slugError.value,
  images: form.images.length > MAX_BLOG_PHOTOS ? `A post can have at most ${MAX_BLOG_PHOTOS} photos` : '',
  authorName: form.authorName.length > 255 ? 'Keep the author under 255 characters' : '',
  tags: tagList.value.length > 10 ? 'Use at most 10 tags'
    : tagList.value.some(t => t.length > 40) ? 'Each tag must be under 40 characters' : ''
}))

const shown = (field: keyof typeof errors.value) => (showErrors.value && errors.value[field]) || undefined

async function save(publish?: boolean) {
  if (publish !== undefined) form.published = publish
  showErrors.value = true

  const first = Object.values(errors.value).find(Boolean)
  if (first) {
    toastError(first)
    return
  }

  saving.value = true
  try {
    if (id) await MarketingApi().updatePost(id, payload())
    else await MarketingApi().createPost(payload())
    success(id ? 'Post updated' : 'Post created')
    await router.push('/blog')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle(id ? 'System Admin · Edit Post' : 'System Admin · New Post')
  useAppStore().setBack('/blog')
  document.title = `${id ? 'Edit Post' : 'New Post'} | Blog | System Admin | Skultem`
  load()
})
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading :title="id ? 'Edit Post' : 'New Post'"
      subtitle="Write the post, add its photos, then publish it to the marketing site.">
      <UButton variant="soft" color="neutral" to="/blog" label="Cancel" :disabled="saving" />
      <UButton variant="outline" color="neutral" icon="i-lucide-eye" label="Preview" :disabled="loading || notFound"
        @click="previewOpen = true" />
      <UButton v-if="!form.published" variant="outline" icon="i-lucide-save" label="Save draft" :loading="saving"
        :disabled="loading || notFound" @click="save(false)" />
      <UButton :icon="form.published ? 'i-lucide-save' : 'i-lucide-send'"
        :label="form.published ? 'Save changes' : 'Publish'" :loading="saving" :disabled="loading || notFound"
        @click="save(true)" />
    </Heading>

    <UCard v-if="notFound">
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="i-lucide-file-x" class="text-4xl text-gray-400" />
        <p class="text-gray-500">This post doesn't exist any more.</p>
        <UButton to="/blog" variant="soft" label="Back to the blog" />
      </div>
    </UCard>

    <UForm v-else :state="form" class="grid items-start gap-4 lg:grid-cols-3" @submit="save()">
      <!-- Left: the writing -->
      <div class="space-y-4 lg:col-span-2">
        <UCard>
          <div v-if="loading" class="space-y-4">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-24 w-full" />
            <USkeleton class="h-72 w-full" />
          </div>

          <div v-else class="space-y-5">
            <UFormField label="Title" required :error="shown('title')">
              <UInput v-model="form.title" size="lg" class="w-full"
                placeholder="e.g. 5 ways to collect school fees on time" />
            </UFormField>

            <UFormField label="Excerpt" help="A short summary for the blog list." :error="shown('excerpt')">
              <UTextarea v-model="form.excerpt" :rows="2" autoresize maxlength="1000" class="w-full" />
            </UFormField>

            <UFormField label="Content" required :error="shown('content')">
              <UEditor v-slot="{ editor }" v-model="form.content" content-type="html"
                placeholder="Write the post..." :ui="{ base: 'min-h-80 p-4' }"
                class="w-full rounded-lg border" :class="shown('content') ? 'border-error' : 'border-default'">
                <UEditorToolbar :editor="editor" :items="(toolbarItems as any)"
                  class="sticky top-0 z-10 flex-wrap border-b border-default bg-default px-2 py-1.5" />
              </UEditor>
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- Right: how it appears -->
      <div class="space-y-4 lg:sticky lg:top-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-globe" class="text-primary" />
              <span class="font-semibold">Publishing</span>
            </div>
          </template>
          <div class="space-y-4">
            <USwitch v-model="form.published" label="Published on the marketing site" />
            <UFormField label="Slug" :error="slugError || undefined"
              :help="slugError ? undefined : (form.slug ? undefined : 'The post\'s web address. Left blank, it is made from the title.')">
              <UInput v-model="form.slug" class="w-full" placeholder="5-ways-to-collect-school-fees"
                :loading="slugChecking" :color="slugError ? 'error' : undefined" :maxlength="SLUG_MAX_LENGTH + 20"
                @blur="form.slug = form.slug.trim()" />
              <template v-if="!slugError" #hint>
                <span v-if="form.slug && !slugChecking" class="flex items-center gap-1 text-success">
                  <UIcon name="i-lucide-check" class="size-3.5" /> Available
                </span>
              </template>
            </UFormField>
            <p v-if="!form.slug && slugPreview" class="-mt-2 truncate text-xs text-muted">
              Will be <span class="font-mono">/blog/{{ slugPreview }}</span>
            </p>
          </div>
        </UCard>

        <UCard>
          <MarketingPhotoGallery v-model="form.images" :max="MAX_BLOG_PHOTOS" />
          <p v-if="shown('images')" class="mt-2 text-xs text-error">{{ shown('images') }}</p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-tags" class="text-primary" />
              <span class="font-semibold">Details</span>
            </div>
          </template>
          <div class="space-y-4">
            <UFormField label="Author" :error="shown('authorName')">
              <UInput v-model="form.authorName" class="w-full" placeholder="e.g. The Skultem Team" />
            </UFormField>
            <UFormField label="Tags" help="Separate with commas, up to 10." :error="shown('tags')">
              <UInput v-model="form.tags" class="w-full" placeholder="fees, tips, announcements" />
            </UFormField>
          </div>
        </UCard>
      </div>
    </UForm>

    <MarketingBlogPreview v-model:open="previewOpen"
      :post="{ title: form.title, excerpt: form.excerpt, content: form.content, images: form.images, authorName: form.authorName, tags: tagList, published: form.published }" />
  </div>
</template>

