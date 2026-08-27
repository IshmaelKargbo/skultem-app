<script setup lang="ts">
const { can } = useAuth()
const visible = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT]))

const loading = ref(false)
const notices = ref<Notice[]>([])
const active = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

// "Important" = pinned or urgent first; if the school hasn't pinned/flagged
// anything yet, fall back to whatever's most recent so the slot isn't empty.
async function fetch() {
  if (!visible.value) return

  loading.value = true
  try {
    const res = await NoticeApi().getAll(1, 10) as any
    const all: Notice[] = res?.data || []

    const important = all.filter(n => n.pinned || n.category === 'URGENT')
    notices.value = (important.length ? important : all).slice(0, 5)
    active.value = 0
  } finally {
    loading.value = false
  }
}

function restart() {
  clearInterval(timer)
  if (notices.value.length > 1) {
    timer = setInterval(() => {
      active.value = (active.value + 1) % notices.value.length
    }, 5000)
  }
}

watch(notices, restart)

onMounted(fetch)
onUnmounted(() => clearInterval(timer))

const current = computed(() => notices.value[active.value])
</script>

<template>
  <NuxtLink
    v-if="visible"
    to="/communicate"
    class="group block w-full overflow-hidden rounded-xl border border-default px-3.5 py-3 transition-all duration-300 hover:border-primary-300"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span class="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">Notice Board</p>
      </div>
      <UIcon name="i-lucide-chevron-right" class="size-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </div>

    <div v-if="loading" class="mt-2 space-y-1.5">
      <USkeleton class="h-3 w-4/5" />
      <USkeleton class="h-2.5 w-3/5" />
    </div>

    <div v-else-if="current" class="mt-1.5 min-h-13">
      <Transition name="notice-slide" mode="out-in">
        <div :key="current.id">
          <div class="flex items-center gap-1.5">
            <UIcon v-if="current.pinned" :name="PIN_ICON" class="size-3 shrink-0 text-primary" />
            <p class="truncate text-xs font-medium text-highlighted">{{ current.title }}</p>
          </div>
          <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">{{ current.content }}</p>
        </div>
      </Transition>

      <div v-if="notices.length > 1" class="mt-2 flex items-center gap-1">
        <span
          v-for="(n, i) in notices"
          :key="n.id"
          class="h-1 rounded-full transition-all duration-300"
          :class="i === active ? 'w-4 bg-primary' : 'w-1 bg-default'"
        />
      </div>
    </div>

    <p v-else class="mt-1.5 text-xs text-muted">Nothing posted yet</p>
  </NuxtLink>
</template>

<style scoped>
.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.notice-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.notice-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
