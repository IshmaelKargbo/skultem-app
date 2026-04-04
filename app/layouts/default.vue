<template>
  <div class="flex h-dvh overflow-hidden">
    <!-- Sidebar -->
    <div class="w-60 hidden md:block">
      <Menu />
    </div>

    <!-- Main Area -->
    <div class="flex flex-1 flex-col min-w-0">
      <Header />
      <div class="flex-1 min-h-0">
        <div class="max-w-screen-2xl mx-auto h-full" ref="scrollContainer">
          <slot />
        </div>
      </div>
      <MenuMobile class="md:hidden block" />
    </div>
  </div>
</template>
<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)

provide('scrollContainer', scrollContainer)
</script>