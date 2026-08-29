<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useCommunicateStore()
const { notices, loading, noticesMeta: meta } = storeToRefs(store)

const { can } = useAuth()
const canManage = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

watch([page, size], () => store.fetchNotices(page.value, size.value), { immediate: true })

onMounted(() => {
  updateQuery({ page: page.value })
  useAppStore().setTitle('Notice Board')
  document.title = 'Notice Board | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT]
})

const search = ref('')
const categoryFilter = ref('')
const deleteModal = ref(false)
const selected = ref<Notice>()

const categoryOptions = [
  { label: 'All categories', value: '' },
  { label: 'General', value: 'GENERAL' },
  { label: 'Academic', value: 'ACADEMIC' },
  { label: 'Fee', value: 'FEE' },
  { label: 'Urgent', value: 'URGENT' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return notices.value
    .filter(n => {
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      const matchesCategory = !categoryFilter.value || n.category === categoryFilter.value
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    })
})

function remove(notice: Notice) {
  selected.value = notice
  deleteModal.value = true
}

async function togglePin(notice: Notice) {
  try {
    await store.togglePin(notice.id)
  } catch (err: any) {
    useNotify().error(err?.message || 'Failed to update notice')
  }
}
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <UCard>
      <template #header>
        <div class="flex justify-between flex-col gap-3 sm:flex-row">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search notices..." class="w-full sm:w-72" />
            <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" class="w-full sm:w-52" />
          </div>
          <CommunicateNoticeAdd v-if="canManage" />
        </div>
      </template>
      <div class="space-y-4">
        <div v-if="loading && !data.length" class="space-y-3">
          <UCard v-for="i in 3" :key="i" :ui="{ body: 'p-4' }">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-1/3" />
                <USkeleton class="h-3 w-full" />
                <USkeleton class="h-3 w-2/3" />
              </div>
            </div>
          </UCard>
        </div>

        <div v-else-if="!data.length"
          class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="NOTICE_ICON" class="text-3xl text-primary-500" />
          </div>
          <h3 class="font-semibold text-highlighted">No notices found</h3>
          <p class="text-sm text-muted">Notices posted to the school will appear here.</p>
        </div>

        <div v-else class="space-y-3">
          <UCard v-for="notice in data" :key="notice.id" :ui="{ body: 'p-4' }"
            :class="notice.pinned ? 'ring-1 ring-primary/30' : ''">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <UIcon v-if="notice.pinned" :name="PIN_ICON" class="size-3.5 text-primary" />
                  <h3 class="truncate font-semibold text-highlighted">{{ notice.title }}</h3>
                  <UBadge :color="noticeCategoryStyle[notice.category].color" variant="subtle" size="sm">
                    {{ noticeCategoryStyle[notice.category].label }}
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="sm">{{ audienceLabel(notice.audience) }}</UBadge>
                  <UBadge v-if="isNoticeExpired(notice)" color="neutral" variant="soft" size="sm">Expired</UBadge>
                </div>

                <p class="mt-2 text-sm text-muted">{{ notice.content }}</p>

                <p class="mt-3 text-xs text-muted">
                  Posted by {{ notice.postedBy }} · {{ formatDateTime(notice.postedAt) }}
                  <template v-if="notice.expiresAt"> · Expires {{ formatDate(notice.expiresAt) }}</template>
                </p>
              </div>

              <div v-if="canManage" class="flex shrink-0 items-center gap-1">
                <UButton :icon="notice.pinned ? UNPIN_ICON : PIN_ICON" size="xs" color="neutral" variant="ghost"
                  @click="togglePin(notice)" />

                <CommunicateNoticeAdd :notice="notice" />

                <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(notice)" />
              </div>
            </div>
          </UCard>
        </div>
      </div>
      <template #footer>
        <div v-if="meta.total" class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <CommunicateNoticeDeletePrompt v-model:open="deleteModal" :notice-id="selected?.id || ''"
      :notice-title="selected?.title || ''" />
  </div>
</template>
