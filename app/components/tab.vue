<template>
  <div class="overflow-x-auto">
    <div class="bg-neutral-200/60 p-1.5 rounded-full inline-flex gap-1 min-w-max">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
        :class="isActive(tab.to, tab.exact)
          ? 'bg-white shadow text-gray-900 font-medium'
          : 'text-gray-600 hover:text-gray-900'"
      >
        {{ tab.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Tab {
  label: string
  to: string
  exact?: boolean
}

const props = defineProps<{
  tabs: Tab[]
}>()

const route = useRoute()

const isActive = (path: string, exact?: boolean) => {
  if (exact) {
    return route.path === path
  }

  return route.path.startsWith(path)
}
</script>
