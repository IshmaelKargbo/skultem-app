<script lang="ts" setup>
import { useRoute } from 'vue-router'

interface Tab {
  key?: string
  label: string
  to?: string
  exact?: boolean
  icon?: string
}

const props = defineProps<{
  tabs: Tab[]
  defaultActive?: string
}>()

const route = useRoute()
const isActive = ref(props.defaultActive || props.tabs[0]?.key || '')
const container = ref<HTMLElement | null>(null)

const hasRouteTabs = computed(() => props.tabs.some(tab => !!tab.to))

function isRouteActive(tab: Tab) {
  if (!tab.to) return false

  if (tab.exact) {
    return route.path === tab.to
  }

  return route.path.startsWith(tab.to)
}

function setActive(key: string) {
  if (key && !hasRouteTabs.value) isActive.value = key
  scrollActiveIntoView()
}

// This is the strip that's actually likely to overflow on a phone screen - without this, the
// active tab could be scrolled out of view with nothing on screen showing which section you're
// in. `inline: 'center'` centers it horizontally; `block: 'nearest'` stops this from also
// scrolling the page vertically.
function scrollActiveIntoView() {
  nextTick(() => {
    container.value?.querySelector('[data-active]')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}

onMounted(scrollActiveIntoView)
watch(() => route.path, scrollActiveIntoView)
</script>

<template>
  <div class="space-y-3">
    <div ref="container"
      class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div
        class="inline-flex min-w-full gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
        <template v-for="tab in tabs" :key="tab.key || tab.to || tab.label">
          <NuxtLink
            v-if="tab.to"
            :to="tab.to"
            :data-active="isRouteActive(tab) || undefined"
            class="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all"
            :class="isRouteActive(tab)
              ? 'bg-secondary-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300'"
          >
            <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
            {{ tab.label }}
          </NuxtLink>

          <button
            v-else
            type="button"
            :data-active="tab.key === isActive || undefined"
            class="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all"
            :class="tab.key === isActive
              ? 'bg-secondary-950 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300'"
            @click="setActive(tab.key || '')"
          >
            <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
            {{ tab.label }}
          </button>
        </template>
      </div>
    </div>

    <!-- Active Slot -->
    <slot v-if="!hasRouteTabs" :name="`${isActive}-data`" />
  </div>
</template>
