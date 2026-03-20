<template>
  <UApp :toaster="toaster">
    <GlobalLoader />
    <NuxtLayout />
  </UApp>
</template>

<script setup lang="ts">
const toaster = { position: 'top-right' }
const { hide } = useGlobalLoader()
onMounted(async () => {
  hide()
})
</script>