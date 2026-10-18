<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)

const { accessToken: token } = useAuthCookies()
const route = useRoute()
const { authResolved } = useAuth()

const layoutReady = computed(
  () => !token.value || authResolved.value,
)

provide('scrollContainer', scrollContainer)

watch(
  () => route.fullPath,
  async () => {
    await nextTick()

    scrollContainer.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <AuthSplash v-if="!layoutReady" />

  <div
    v-else
    class="flex h-dvh overflow-hidden bg-[--app-bg]"
  >
    <!-- Desktop Sidebar -->
    <aside class="hidden w-72 shrink-0 p-4 pr-0.5 lg:block">
      <Menu />
    </aside>

    <!-- Application Area -->
    <div class="flex relative min-w-0 flex-1 flex-col">
      <!-- Header -->
      <Header class="absolute left-0 right-0 z-[1100]" />
      <PlaygroundBanner class="shrink-0" />

      <!-- Scroll Container -->
      <main
        ref="scrollContainer"
        class="min-h-0 flex-1 md:mt-1 pt-20 overflow-y-auto overflow-x-hidden"
      >
        <div class="py-4">
          <slot />
        </div>
      </main>

      <!-- Mobile Navigation -->
      <MenuMobile class="absolute w-full bottom-0 z-[1100] pb-[max(env(safe-area-inset-bottom),0.5rem)] lg:hidden" />
    </div>
  </div>
</template>