<template>
  <div class="flex h-screen overflow-hidden">
    <Menu />
    <div class="flex-1 flex flex-col">
      <Header />
      <div ref="scrollContainer" class="flex-1 overflow-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)

provide('scrollContainer', scrollContainer)
</script>