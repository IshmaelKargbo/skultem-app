<template>
  <div v-if="layoutReady" class="flex h-dvh overflow-hidden">
    <!-- Sidebar -->
    <div class="w-60 hidden md:block">
      <Menu />
    </div>

    <!-- Main Area -->
    <div class="flex flex-1 flex-col min-w-0">
      <Header />
      <div class="flex-1 min-h-0">
        <div class="max-w-screen-2xl mx-auto h-full overflow-y-auto overflow-x-hidden" ref="scrollContainer">
          <slot />
        </div>
      </div>
      <MenuMobile class="md:hidden block" />
    </div>
  </div>
  <AuthSplash v-else />
</template>
<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)
const token = useCookie('access_token')
const route = useRoute()
const { authResolved } = useAuth()
const layoutReady = computed(() => !token.value || authResolved.value)

provide('scrollContainer', scrollContainer)

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)
</script>
