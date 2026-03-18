<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <GlobalLoader />
      <NuxtPage v-if="isReady" />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const toaster = { position: 'top-right' }
const { show, hide } = useGlobalLoader()
const isReady = ref(false)

onMounted(async () => {
  show()
  await useUserStore().me()
  await nextTick()
  isReady.value = true
  hide()
})
</script>