<template>
  <div>
    <div
      @click="handleClick"
      :class="[
        'flex items-center justify-between text-sm border-2 md:p-2.5 py-1 md:px-3 dark:border-gray-900 rounded-xl dark:bg-gray-900 md:hover:bg-primary-100 dark:md:hover:bg-primary-950 md:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-200 border-white cursor-pointer',
        isActive || open ? 'md:bg-primary-100 md:border-primary-400 dark:md:border-primary-800 text-primary-600 dark:text-primary-200  dark:bg-primary-950' : '',
        customClass
      ]"
    >
      <div class="flex flex-col w-full md:w-auto md:flex-row items-center md:space-x-2.5 space-y-1 text-xs md:text-sm">
        <slot name="icon" :active="isActive" />
        <span><slot>{{ label }}</slot></span>
      </div>
      <svg
        v-if="subNavs && subNavs.length"
        class="w-4 h-4 transition-transform duration-200 hidden md:block"
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
          :class="isActiveSub(nav) ? 'bg-primary-500 font-semibold text-white' : 'text-gray-800'"
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