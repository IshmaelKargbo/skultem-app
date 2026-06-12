<template>
  <div class="overflow-x-auto">
    <div class="bg-white dark:bg-gray-900 dark:border-gray-800 border-2 border-gray-200 p-1.5 rounded-3xl inline-flex gap-1 min-w-max shadow-sm">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="px-3 py-1.5 text-[12px] sm:text-[13px] rounded-3xl transition-all duration-200 whitespace-nowrap"
        :class="isActive(tab.to, tab.exact)
          ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-800 dark:text-primary-200'
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
