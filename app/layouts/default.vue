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
  <div v-if="layoutReady" class="flex h-dvh overflow-hidden">
    <div class="w-72 hidden md:block p-4 pr-0.5">
      <Menu />
    </div>
    <div class="flex flex-1 flex-col min-w-0">
      <Header />
      <div class="flex-1 min-h-0 mt-1">
        <div ref="scrollContainer" class="max-w-screen-2xl mx-auto h-full overflow-y-auto overflow-x-hidden">
          <slot />
        </div>
      </div>
      <MenuMobile class="md:hidden block" />
    </div>
  </div>
  <AuthSplash v-else />
</template>
