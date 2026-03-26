<template>
  <UApp>
    <GlobalLoader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { hide } = useGlobalLoader()
onMounted(async () => {
  hide()
})
</script>