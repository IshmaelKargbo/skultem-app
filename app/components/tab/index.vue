<template>
  <div ref="container" class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
    <div class="inline-flex min-w-max gap-1 rounded-3xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
      <template v-for="tab in tabs" :key="tab.key || tab.to || tab.label">
        <NuxtLink
          v-if="tab.to"
          :to="tab.to"
          :data-active="isActive(tab.to, tab.exact) || undefined"
          class="flex items-center gap-1.5 rounded-3xl px-3 py-2 text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
          :class="isActive(tab.to, tab.exact) ? activeClass : idleClass"
        >
          <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
        </NuxtLink>

        <!-- No `to`: a tab that switches something on this page, driven by v-model -->
        <button
          v-else
          type="button"
          :data-active="tab.key === modelValue || undefined"
          class="flex items-center gap-1.5 rounded-3xl px-3 py-2 text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
          :class="tab.key === modelValue ? activeClass : idleClass"
          @click="tab.key && emit('update:modelValue', tab.key)"
        >
          <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
          <UBadge v-if="tab.count !== undefined" size="sm" variant="subtle" :color="tab.warn && tab.count ? 'warning' : tab.key === modelValue ? 'secondary' : 'neutral'" :label="tab.count" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Tab {
  key?: string
  label: string
  to?: string
  exact?: boolean
  icon?: string
  count?: number
  warn?: boolean
}

const props = defineProps<{
  tabs: Tab[]
  modelValue?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

const activeClass = 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
const idleClass = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'

const route = useRoute()
const container = ref<HTMLElement | null>(null)

const isActive = (path: string, exact?: boolean) => {
  // `path` (tab.to) can carry a query string, e.g. `/students/1?back=/classes/2` - strip it
  // before comparing, since `route.path` never includes one and would otherwise never match.
  const pathname = path.split('?')[0]

  if (exact) {
    return route.path === pathname
  }

  return route.path.startsWith(pathname)
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
watch(() => props.modelValue, scrollActiveIntoView)
</script>
