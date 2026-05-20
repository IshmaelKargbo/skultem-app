<template>
  <div class="overflow-x-auto">
    <div class="bg-white dark:bg-gray-900 dark:border-gray-800 border-2 border-gray-200 p-2 rounded-full inline-flex gap-1 min-w-max">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="px-2.5 py-1 text-[13px] rounded-full transition-all duration-200 whitespace-nowrap"
        :class="isActive(tab.to, tab.exact)
          ? 'bg-primary-50 dark:bg-gray-950 border border-primary-400 dark:border-primary-600 text-primary-600'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
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
