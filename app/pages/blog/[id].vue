<script setup lang="ts">
definePageMeta({ role: [Role.SYSTEM_ADMIN] })

const route = useRoute()
</script>

<template>
  <!-- keyed so moving between two posts starts a fresh form -->
  <MarketingBlogForm :id="route.params.id as string" :key="route.params.id as string" />
</template>
