<template>
  <UApp>
    <!-- Route navigation gets a thin bar; the full-screen GlobalLoader is kept for blocking moments
         (first load, sign-in, role switch). Throttled so quick navigations show nothing at all. -->
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
