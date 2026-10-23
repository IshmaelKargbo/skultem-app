<script setup lang="ts">
// How a post reads: the cover, title, byline, the written content and the rest of the photos. Shown from
// what is in the form (saved or not) or from a saved post. The marketing site has its own styling - this
// is a close guide to the content, not a pixel copy.
const open = defineModel<boolean>('open', { required: true })
const { post } = defineProps<{
  post: {
    title: string
    excerpt?: string | null
    content?: string | null
    images?: string[]
    authorName?: string | null
    tags?: string[]
    published?: boolean
    publishedAt?: string | null
  } | null
}>()

const device = ref<'desktop' | 'mobile'>('desktop')

const cover = computed(() => post?.images?.[0])
const more = computed(() => post?.images?.slice(1) ?? [])
const date = computed(() => {
  const d = post?.publishedAt ? new Date(post.publishedAt) : new Date()
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
})
const words = computed(() => (post?.content ?? '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length)
const readMinutes = computed(() => Math.max(1, Math.round(words.value / 200)))
const author = computed(() => post?.authorName?.trim() || 'Skultem Team')
const initials = computed(() => author.value.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())
const primaryTag = computed(() => post?.tags?.[0])
const wide = computed(() => device.value === 'desktop')

// Reading progress follows how far down the article you have scrolled (the modal's own scroll area).
const article = ref<HTMLElement | null>(null)
const progress = ref(0)
let scroller: HTMLElement | null = null

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) return node
  }
  return null
}

function updateProgress() {
  const el = article.value
  if (!el) return
  const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight }
  const box = el.getBoundingClientRect()
  // 0 until the article's top reaches the top of the view, 100 once its bottom has reached the bottom.
  const scrolled = view.top - box.top
  const total = box.height - view.height
  progress.value = total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)))
}

watch([open, article, wide], async () => {
  scroller?.removeEventListener('scroll', updateProgress)
  scroller = null
  if (!open.value) return
  await nextTick()
  scroller = scrollParent(article.value)
  scroller?.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
}, { flush: 'post' })

onBeforeUnmount(() => scroller?.removeEventListener('scroll', updateProgress))

const hasContent = computed(() => !!post?.content && post.content.replace(/<[^>]*>/g, '').trim().length > 0)
</script>

<template>
  <UModal v-model:open="open" fullscreen title="Preview" description="How this post will read"
    :ui="{ body: 'p-0 sm:p-0 bg-muted/30', header: 'border-b border-default' }">
    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <UIcon name="i-lucide-eye" class="shrink-0 text-primary" />
          <p class="truncate font-semibold">Preview</p>
          <UBadge v-if="post" size="sm" variant="subtle" :color="post.published ? 'success' : 'neutral'">
            {{ post.published ? 'Published' : 'Draft' }}
          </UBadge>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden rounded-lg bg-elevated p-0.5 sm:flex">
            <UButton size="xs" icon="i-lucide-monitor" label="Desktop" :variant="device === 'desktop' ? 'solid' : 'ghost'"
              :color="device === 'desktop' ? 'primary' : 'neutral'" @click="device = 'desktop'" />
            <UButton size="xs" icon="i-lucide-smartphone" label="Mobile" :variant="device === 'mobile' ? 'solid' : 'ghost'"
              :color="device === 'mobile' ? 'primary' : 'neutral'" @click="device = 'mobile'" />
          </div>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Close preview" @click="open = false" />
        </div>
      </div>
    </template>

    <template #body>
      <div class="p-4 md:p-8">
        <div v-if="post" class="mx-auto space-y-8 transition-all" :class="wide ? 'max-w-5xl' : 'max-w-sm'">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-xs text-muted">
            <UIcon name="i-lucide-newspaper" class="size-3.5" />
            <span>Blog</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" />
            <span class="truncate font-medium text-highlighted">{{ post.title || 'Untitled post' }}</span>
          </nav>

          <!-- Header -->
          <header class="max-w-3xl space-y-4">
            <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
              <UBadge v-if="primaryTag" size="sm" variant="subtle" color="primary" :label="primaryTag" />
              <span>{{ date }}</span>
              <span class="flex items-center gap-1"><UIcon name="i-lucide-clock" class="size-3.5" /> {{ readMinutes }} min read</span>
            </div>

            <h1 class="font-bold leading-tight tracking-tight text-highlighted" :class="wide ? 'text-4xl md:text-5xl' : 'text-2xl'">
              {{ post.title || 'Untitled post' }}
            </h1>

            <p v-if="post.excerpt" class="text-toned" :class="wide ? 'text-lg' : 'text-base'">{{ post.excerpt }}</p>

            <div class="flex items-center gap-3 pt-1">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">
                {{ initials }}
              </span>
              <div class="leading-tight">
                <p class="text-sm font-semibold text-highlighted">{{ author }}</p>
                <p class="text-xs text-muted">Skultem · skultem.com</p>
              </div>
            </div>
          </header>

          <img v-if="cover" :src="cover" alt="" class="aspect-video w-full rounded-2xl object-cover">

          <div class="grid gap-10" :class="wide ? 'lg:grid-cols-[minmax(0,1fr)_16rem]' : ''">
            <!-- Article -->
            <div ref="article" class="min-w-0 space-y-8">
              <div v-if="hasContent" class="blog-preview-content" v-html="post.content" />
              <p v-else class="rounded-lg border border-dashed border-default p-6 text-center text-sm text-muted">
                Nothing written yet.
              </p>

              <div v-if="more.length" class="grid grid-cols-2 gap-2">
                <img v-for="url in more" :key="url" :src="url" alt="" class="aspect-4/3 w-full rounded-lg object-cover"
                  :class="more.length === 1 ? 'col-span-2' : ''">
              </div>

              <!-- Footer: back, copy link, share -->
              <div class="flex items-center justify-between gap-3 border-t border-default pt-5">
                <span class="flex items-center gap-1.5 text-sm text-muted">
                  <UIcon name="i-lucide-arrow-left" class="size-4" /> Back to blog
                </span>
                <div class="flex items-center gap-2">
                  <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-link" label="Copy link" tabindex="-1" />
                  <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-message-circle" square tabindex="-1" aria-label="Share on WhatsApp" />
                  <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-mail" square tabindex="-1" aria-label="Share by email" />
                </div>
              </div>

              <!-- Other posts (shown for layout - the live site fills these in) -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-default p-4 opacity-60">
                  <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Previous article</p>
                  <p class="mt-1 text-sm font-semibold text-highlighted">An earlier post</p>
                  <p class="text-xs text-muted">The post published before this one.</p>
                </div>
                <div class="rounded-xl border border-default p-4 text-right opacity-60">
                  <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Next article</p>
                  <p class="mt-1 text-sm font-semibold text-highlighted">A later post</p>
                  <p class="text-xs text-muted">The post published after this one.</p>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <aside v-if="wide" class="sticky top-6 space-y-5 self-start text-sm">
              <div class="space-y-2">
                <p class="text-xs font-semibold text-highlighted">Reading progress</p>
                <div class="h-1.5 overflow-hidden rounded-full bg-elevated"><div class="h-full rounded-full bg-primary transition-[width] duration-150" :style="{ width: `${progress}%` }" /></div>
                <p class="text-[11px] text-muted">{{ progress }}% read · {{ readMinutes }} min read</p>
              </div>

              <div class="space-y-2">
                <p class="text-xs font-semibold text-highlighted">Links</p>
                <ul class="space-y-2 text-xs text-toned">
                  <li class="flex items-center gap-2"><UIcon name="i-lucide-message-circle" class="size-4 text-muted" /> Follow us on WhatsApp channel</li>
                  <li class="flex items-center gap-2"><UIcon name="i-lucide-presentation" class="size-4 text-muted" /> Request a demo</li>
                  <li class="flex items-center gap-2"><UIcon name="i-lucide-layout-grid" class="size-4 text-muted" /> Browse all articles</li>
                </ul>
              </div>

              <div class="space-y-3 rounded-2xl bg-linear-to-br from-primary-700 to-primary-950 p-4 text-white">
                <UIcon name="i-lucide-graduation-cap" class="size-5 opacity-80" />
                <p class="text-sm font-semibold leading-snug">Building a better school?</p>
                <p class="text-xs opacity-80">See how Skultem brings school operations together.</p>
                <span class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary-700">
                  Request a demo <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.blog-preview-content {
  line-height: 1.8;
  font-size: 0.9375rem;
  color: var(--ui-text-toned);
  overflow-wrap: anywhere;
}

.blog-preview-content :deep(p) { margin: 0 0 1em; }
.blog-preview-content :deep(h1),
.blog-preview-content :deep(h2),
.blog-preview-content :deep(h3),
.blog-preview-content :deep(h4) { color: var(--ui-text-highlighted); font-weight: 700; line-height: 1.25; margin: 1.6em 0 0.6em; }
.blog-preview-content :deep(h1) { font-size: 1.75rem; }
.blog-preview-content :deep(h2) { font-size: 1.4rem; }
.blog-preview-content :deep(h3) { font-size: 1.15rem; }
.blog-preview-content :deep(h4) { font-size: 1rem; }
.blog-preview-content :deep(ul) { list-style: disc; padding-left: 1.5em; margin: 0 0 1em; }
.blog-preview-content :deep(ol) { list-style: decimal; padding-left: 1.5em; margin: 0 0 1em; }
.blog-preview-content :deep(li) { margin: 0.25em 0; }
.blog-preview-content :deep(blockquote) { border-left: 3px solid var(--ui-primary); padding-left: 1em; margin: 1.2em 0; font-style: italic; }
.blog-preview-content :deep(hr) { border: 0; border-top: 1px solid var(--ui-border); margin: 1.8em 0; }
.blog-preview-content :deep(a) { color: var(--ui-primary); text-decoration: underline; }
.blog-preview-content :deep(img) { max-width: 100%; border-radius: 0.5rem; margin: 1em 0; }
.blog-preview-content :deep(code) { background: var(--ui-bg-elevated); padding: 0.1em 0.35em; border-radius: 0.25rem; font-size: 0.9em; }
.blog-preview-content :deep(pre) { background: var(--ui-bg-elevated); padding: 1em; border-radius: 0.5rem; overflow-x: auto; margin: 1em 0; }
</style>
