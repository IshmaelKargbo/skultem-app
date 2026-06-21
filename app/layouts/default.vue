<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)
const token = useCookie('access_token')
const route = useRoute()
const { authResolved } = useAuth()
const layoutReady = computed(() => !token.value || authResolved.value)

provide('scrollContainer', scrollContainer)

watch(() => route.fullPath, () => {
  scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div v-if="layoutReady" class="flex h-dvh overflow-hidden bg-[var(--app-bg)]">
    <div class="w-72 hidden md:block p-4 pr-0.5">
      <Menu />
    </div>
    <div class="flex flex-1 flex-col min-w-0">
      <div ref="scrollContainer"
        class="max-w-screen-2xl mx-auto h-full w-full overflow-y-auto overflow-x-hidden p-2 sm:p-3 lg:p-4">
        <slot />
      </div>
      <MenuMobile class="md:hidden block sticky bottom-0 z-20" />
    </div>
  </div>
  <AuthSplash v-else />
</template>
