<template>
  <div>
    <div
      @click="handleClick"
      :class="[
        'flex min-h-11 items-center justify-between gap-2 text-sm border-2 md:p-2.5 py-2 px-2 md:px-3 dark:border-gray-900 rounded-xl dark:bg-gray-900 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer transition-colors',
        isActive || open ? 'md:bg-primary-50 md:border-primary-300 dark:md:bg-primary-950 dark:md:border-primary-800 text-primary-600 dark:text-primary-200' : '',
        customClass
      ]"
    >
      <div class="flex w-full min-w-0 items-center gap-2.5 text-xs md:text-sm">
        <span class="shrink-0 inline-flex items-center justify-center">
          <slot name="icon" :active="isActive" />
        </span>
        <span class="truncate"><slot>{{ label }}</slot></span>
      </div>
      <svg
        v-if="subNavs && subNavs.length"
        class="w-4 h-4 shrink-0 transition-transform duration-200 hidden md:block"
        :class="open ? 'rotate-90' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
    <div v-if="open && subNavs && subNavs.length" class="ml-4 pl-2 mt-2 border-l border-dashed border-primary-600 flex flex-col space-y-1">
      <slot
        name="subNav"
        :subNavs="subNavs"
        :route="route"
        :isActiveSub="isActiveSub"
      />
      <template v-if="!$slots.subNav">
        <router-link
          v-for="nav in subNavs"
          :key="nav.to"
          :to="nav.to"
          class="flex items-center p-2 rounded-md hover:bg-primary-500 space-x-2"
          :class="isActiveSub(nav) ? 'bg-primary-500 font-semibold text-white dark:text-primary-500' : 'text-gray-800'"
        >
          <span v-if="nav.icon" class="w-4 h-4 shrink-0">
            <component :is="nav.icon" />
          </span>
          <span>{{ nav.label }}</span>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface SubNav {
  label: string
  to: string
  icon?: any
  exact?: boolean
}

const props = defineProps<{
  label?: string
  to?: string
  exact?: boolean
  subNavs?: SubNav[]
  customClass?: string
}>()

const route = useRoute()
const router = useRouter()
const open = ref(false)

// Parent active: active if parent link or any subNav matches
const isActive = computed(() => {
  if (props.subNavs && props.subNavs.length) {
    return props.subNavs.some(nav =>
      nav.exact ? route.path === nav.to : route.path.startsWith(nav.to)
    )
  }
  if (!props.to) return false
  return props.exact ? route.path === props.to : route.path.startsWith(props.to)
})

// Subnav active check: uses nav.exact if provided
const isActiveSub = (nav: SubNav) =>
  nav.exact ? route.path === nav.to : route.path.startsWith(nav.to)

const handleClick = () => {
  if (props.subNavs && props.subNavs.length) {
    open.value = !open.value
  } else if (props.to) {
    router.push(props.to)
  }
}
</script>
