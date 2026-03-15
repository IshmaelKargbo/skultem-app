<template>
  <div class="flex h-dvh overflow-hidden">
    <!-- Sidebar -->
    <Menu class="w-64" />

    <!-- Main Area -->
    <div class="flex flex-1 flex-col min-w-0">
      <Header />

      <!-- Scrollable Content -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto">
        <div class="max-w-screen-2xl mx-auto p-2">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)

provide('scrollContainer', scrollContainer)
</script>