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
    <!-- From xl up: below that (tablets, small laptops) the bottom bar and the slide-in menu are used, so pages keep
         the full screen width for their own two- and three-column layouts. -->
    <aside class="hidden shrink-0 p-4 pr-0.5 xl:block xl:w-64 2xl:w-72">
      <Menu />
    </aside>

    <!-- Application Area -->
    <div class="flex relative min-w-0 flex-1 flex-col">
      <!-- Header -->
      <Header class="absolute left-0 right-0 z-1100" />
      <PlaygroundBanner class="shrink-0 pt-18" />

      <!-- Scroll Container -->
      <main
        ref="scrollContainer"
        class="min-h-0 flex-1 md:mt-1 overflow-y-auto overflow-x-hidden"
      >
        <div class="pb-28 pt-20 md:pt-24 xl:pb-10">
          <slot />
        </div>
      </main>

      <!-- Mobile Navigation -->
      <MenuMobile class="absolute w-full bottom-0 z-1100 pb-[max(env(safe-area-inset-bottom),0.5rem)] xl:hidden" />
    </div>
  </div>
</template>