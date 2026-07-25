<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)

const token = useCookie('access_token')
const route = useRoute()
const { authResolved } = useAuth()

const layoutReady = computed(
  () => !token.value || authResolved.value
)

provide('scrollContainer', scrollContainer)

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    scrollContainer.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
)
</script>

<template>
  <AuthSplash v-if="!layoutReady" />
  <div v-else class="flex h-dvh overflow-hidden bg-[--app-bg]">
  
    <!-- Desktop Sidebar -->
    <aside class="hidden w-72 p-4 pr-0.5 md:block">
      <Menu />
    </aside>

    <!-- Main Content -->
    <main
      ref="scrollContainer"
      class="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <Header class="sticky top-0 z-20 md:hidden" />
      <div class="container mx-auto flex-1  py-4 ">
        <slot />
      </div>
      <!-- Mobile Navigation -->
      <MenuMobile class="sticky bottom-0 z-20 md:hidden" />
    </main>
  </div>
</template>
