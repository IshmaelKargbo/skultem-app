<template>
  <div>
    <!-- Main Item -->
    <div
      @click="handleClick"
      :class="[
        'flex items-center justify-between text-sm border p-2.5 px-3 rounded-md hover:bg-app-600 hover:border-gray-700 border-menu cursor-pointer',
        isActive || open ? 'bg-app-800 border-gray-900' : '',
        customClass
      ]"
    >
      <div class="flex items-center space-x-2.5">
        <slot name="icon" :active="isActive" />
        <span><slot>{{ label }}</slot></span>
      </div>

      <!-- Chevron if dropdown -->
      <svg
        v-if="subNavs && subNavs.length"
        class="w-4 h-4 transition-transform duration-200"
        :class="open ? 'rotate-90' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <!-- Nested Links / Subnav -->
    <div v-if="open && subNavs && subNavs.length" class="ml-4 pl-2 mt-2 border-l border-dashed border-gray-700 flex flex-col space-y-1">
      <slot
        name="subNav"
        :subNavs="subNavs"
        :route="route"
        :isActiveSub="isActiveSub"
      />

      <!-- Default rendering if no slot provided -->
      <template v-if="!$slots.subNav">
        <router-link
          v-for="nav in subNavs"
          :key="nav.to"
          :to="nav.to"
          class="flex items-center p-2 rounded-md hover:bg-app-600 space-x-2"
          :class="isActiveSub(nav) ? 'bg-app-800 font-semibold text-blue-400' : 'text-gray-400'"
        >
          <!-- Optional icon -->
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