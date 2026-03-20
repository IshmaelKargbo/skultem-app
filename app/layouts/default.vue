<template>
  <div class="flex h-dvh overflow-hidden">
    <!-- Sidebar -->
    <Menu class="w-64" />

    <!-- Main Area -->
    <div class="flex flex-1 flex-col min-w-0">
      <Header />
      <div class="flex-1 min-h-0">
        <div class="max-w-screen-2xl mx-auto h-full">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>