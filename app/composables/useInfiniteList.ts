// A list that loads its next page when the end of it scrolls into view, instead of page buttons.
// Put the returned `sentinel` ref on an element after the last row (see components/InfiniteListEnd.vue).
// Pass `root` when the list scrolls inside its own box rather than with the page.

type PageResult<T> = { data: T[], meta: Meta } | undefined | null
type ListOptions = { size?: number, root?: Ref<HTMLElement | null> }

export function useInfiniteList<T extends { id: string }>(fetchPage: (page: number, size: number) => Promise<PageResult<T>>, options: ListOptions = {}) {
  const size = options.size ?? 20
  const items = ref<T[]>([]) as Ref<T[]>
  const meta = ref<Meta>()
  const loading = ref(true)
  const loadingMore = ref(false)
  const failed = ref(false)
  // Why the last load failed, shown to the user instead of an empty list.
  const error = ref<string | null>(null)
  const sentinel = ref<HTMLElement | null>(null)
  const hasMore = computed(() => !!meta.value && items.value.length < (meta.value.total ?? 0))

  let page = 1
  // Each reload gets a number, so an older, slower answer can't overwrite a newer one.
  let request = 0
  let observer: IntersectionObserver | null = null

  // First page (on open, or when a search, filter or sort changes): replaces the list.
  async function reload() {
    const mine = ++request
    loading.value = true
    failed.value = false
    error.value = null
    page = 1
    try {
      const res = await fetchPage(1, size)
      if (mine !== request) return
      items.value = res?.data ?? []
      meta.value = res?.meta
    } catch (err: any) {
      if (mine === request) {
        items.value = []
        meta.value = undefined
        failed.value = true
        error.value = err?.message || 'Something went wrong'
        console.error('List failed to load', err)
      }
    } finally {
      if (mine === request) loading.value = false
    }
    await fillView()
  }

  // The next page: added to the end.
  async function loadMore() {
    // The first page itself failed: try that again.
    if (!loading.value && failed.value && !items.value.length) return reload()
    if (loading.value || loadingMore.value || !hasMore.value) return
    const mine = request
    loadingMore.value = true
    failed.value = false
    error.value = null
    try {
      const res = await fetchPage(page + 1, size)
      if (mine !== request) return
      if (!res) {
        failed.value = true
        error.value = 'Something went wrong'
        return
      }
      page += 1
      const seen = new Set(items.value.map(i => i.id))
      items.value.push(...res.data.filter(i => !seen.has(i.id)))
      meta.value = res.meta
    } catch (err: any) {
      if (mine === request) {
        failed.value = true
        error.value = err?.message || 'Something went wrong'
        console.error('List failed to load more', err)
      }
    } finally {
      loadingMore.value = false
    }
    await fillView()
  }

  // When a page doesn't fill the screen, the end is still in view and the observer won't fire again - keep loading.
  async function fillView() {
    await nextTick()
    if (!failed.value && endInView()) loadMore()
  }

  function endInView() {
    if (!sentinel.value) return false
    const end = sentinel.value.getBoundingClientRect().top
    const bottom = options.root?.value ? options.root.value.getBoundingClientRect().bottom : window.innerHeight
    return end < bottom + 300
  }

  function observe() {
    observer?.disconnect()
    observer = null
    if (!sentinel.value || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) loadMore() },
      { root: options.root?.value ?? null, rootMargin: '0px 0px 300px 0px' }
    )
    observer.observe(sentinel.value)
  }

  // The sentinel (or the scrolling box) can come and go with v-if - watch it again each time.
  watch([sentinel, () => options.root?.value], () => observe(), { flush: 'post' })
  onBeforeUnmount(() => observer?.disconnect())

  return { items, meta, loading, loadingMore, failed, error, hasMore, sentinel, reload, loadMore }
}
