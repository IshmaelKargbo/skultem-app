<template>
  <div class="overflow-x-auto">
    <div class="inline-flex min-w-max gap-1 rounded-3xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="rounded-3xl px-3 py-2 text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
        :class="isActive(tab.to, tab.exact)
          ? 'bg-primary-100 text-primary-600 font-semibold dark:bg-primary-800 dark:text-primary-200'
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
