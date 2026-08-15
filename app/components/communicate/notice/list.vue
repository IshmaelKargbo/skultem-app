<script setup lang="ts">
const store = useCommunicateStore()
const { notices } = storeToRefs(store)

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

function togglePin(notice: Notice) {
  store.togglePin(notice.id)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search notices..." class="w-full sm:w-72" />
      <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" class="w-full sm:w-52" />
    </div>

    <div v-if="!data.length" class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16">
      <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
        <UIcon :name="NOTICE_ICON" class="text-3xl text-primary-500" />
      </div>
      <h3 class="font-semibold text-highlighted">No notices found</h3>
      <p class="text-sm text-muted">Notices posted to the school will appear here.</p>
    </div>

    <div v-else class="space-y-3">
      <UCard v-for="notice in data" :key="notice.id" :ui="{ body: 'p-4' }" :class="notice.pinned ? 'ring-1 ring-primary/30' : ''">
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

          <div class="flex shrink-0 items-center gap-1">
            <UButton
              :icon="notice.pinned ? UNPIN_ICON : PIN_ICON"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="togglePin(notice)"
            />

            <CommunicateNoticeAdd :notice="notice" />

            <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(notice)" />
          </div>
        </div>
      </UCard>
    </div>

    <CommunicateNoticeDeletePrompt
      v-model:open="deleteModal"
      :notice-id="selected?.id || ''"
      :notice-title="selected?.title || ''"
    />
  </div>
</template>
