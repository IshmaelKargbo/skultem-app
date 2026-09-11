<script lang="ts" setup>
import { useRoute } from 'vue-router'

interface Tab {
  key?: string
  label: string
  to?: string
  exact?: boolean
}

const props = defineProps<{
  tabs: Tab[]
  defaultActive?: string
}>()

const route = useRoute()
const isActive = ref(props.defaultActive || props.tabs[0]?.key || '')

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
}
</script>

<template>
  <div class="space-y-3">
    <div class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div
        class="inline-flex min-w-full gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <template v-for="tab in tabs" :key="tab.key || tab.to || tab.label">
          <NuxtLink
            v-if="tab.to"
            :to="tab.to"
            class="shrink-0 rounded-xl px-3.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all"
            :class="isRouteActive(tab)
              ? 'bg-secondary-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300'"
          >
            {{ tab.label }}
          </NuxtLink>

          <button
            v-else
            type="button"
            class="shrink-0 rounded-xl px-3.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all"
            :class="tab.key === isActive
              ? 'bg-secondary-950 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300'"
            @click="setActive(tab.key || '')"
          >
            {{ tab.label }}
          </button>
        </template>
      </div>
    </div>

    <!-- Active Slot -->
    <slot v-if="!hasRouteTabs" :name="`${isActive}-data`" />
  </div>
</template>
