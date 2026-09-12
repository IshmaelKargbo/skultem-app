<template>
  <div ref="container" class="overflow-x-auto">
    <div class="inline-flex min-w-max gap-1 rounded-3xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        :data-active="isActive(tab.to, tab.exact) || undefined"
        class="flex items-center gap-1.5 rounded-3xl px-3 py-2 text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
        :class="isActive(tab.to, tab.exact)
          ? 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
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
  icon?: string
}

const props = defineProps<{
  tabs: Tab[]
}>()

const route = useRoute()
const container = ref<HTMLElement | null>(null)

const isActive = (path: string, exact?: boolean) => {
  if (exact) {
    return route.path === path
  }

  return route.path.startsWith(path)
}

// On a narrow screen this strip can overflow - without this, whichever tab is active could be
// scrolled off to the side with no visual hint it's even in the list. `inline: 'center'` centers
// it in the scroll container; `block: 'nearest'` keeps this from also scrolling the page itself.
function scrollActiveIntoView() {
  nextTick(() => {
    container.value?.querySelector('[data-active]')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}

onMounted(scrollActiveIntoView)
watch(() => route.path, scrollActiveIntoView)
</script>
