<script setup lang="ts">
// The full navigation for screens that have no sidebar (tablets and small laptops, below xl): the same menu the
// sidebar shows, in a panel that slides in from the left and closes when you pick a page.
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <USlideover v-model:open="open" side="left" :ui="{ content: 'w-full max-w-xs bg-transparent p-3 ring-0 shadow-none', body: 'p-0' }">
    <UButton color="neutral" variant="ghost" icon="lucide:panel-left" aria-label="Open menu" class="shrink-0" />

    <template #content>
      <div class="h-full">
        <Menu />
      </div>
    </template>
  </USlideover>
</template>
