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
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 grid gap-1 rounded-xl shadow-sm"
         :style="{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }">

      <template v-for="tab in tabs" :key="tab.key || tab.to || tab.label">
        <NuxtLink
          v-if="tab.to"
          :to="tab.to"
          class="flex justify-center px-2 py-1.5 text-center cursor-pointer transition-all"
          :class="{
            'bg-primary-500 rounded-md text-white': isRouteActive(tab),
            'text-gray-700 dark:text-gray-200': !isRouteActive(tab)
          }"
        >
          <p class="text-xs font-medium"> {{ tab.label }}</p>
        </NuxtLink>

        <button
          v-else
          type="button"
          class="flex justify-center px-2 py-1.5 text-center cursor-pointer transition-all"
          :class="{
            'bg-primary-950 rounded-md text-white': tab.key === isActive,
            'text-gray-700 dark:text-gray-200': tab.key !== isActive
          }"
          @click="setActive(tab.key || '')"
        >
          <p class="text-xs font-medium">{{ tab.label }}</p>
        </button>
      </template>

    </div>

    <!-- Active Slot -->
    <slot v-if="!hasRouteTabs" :name="`${isActive}-data`" />
  </div>
</template>
