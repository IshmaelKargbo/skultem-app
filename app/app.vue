<template>
  <!-- Toasts: in front of the header and mobile menu (z-1100). Below xl they sit just above the mobile menu,
       in the 5.5rem the layout keeps free for it (same as PushPrompt); from xl, where it's hidden, in the corner. -->
  <!-- en-GB: dates read day-first (dd/mm/yyyy) and the calendar starts on Monday, as in Sierra Leone. -->
  <UApp :locale="en_gb" :toaster="{ ui: { viewport: 'z-[1200] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] xl:bottom-4' } }">
    <NuxtLoadingIndicator
      color="linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899)"
      :height="3"
      :throttle="200"
    />
    <GlobalLoader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { en_gb } from '@nuxt/ui/locale'
</script>
