<template>
  <!-- Quick-nav across the Classes pages, same Tab/TabMobile pair used for Fees & Payments and
       student/teacher profiles - so hopping between Classes/Sections/Streams doesn't mean going
       back to the sidebar every time. Each item gated by that page's own definePageMeta roles. -->
  <TabMobile class="md:hidden" :tabs="items" />
  <Tab class="hidden md:block" :tabs="items" />
</template>

<script setup lang="ts">
const { can } = useAuth()

interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  roles: Role[]
}

const allItems: NavItem[] = [
  { label: 'Classes', to: '/classes', icon: CLASS_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER, Role.TEACHER] },
  { label: 'Sections', to: '/classes/sections', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },
  { label: 'Streams', to: '/classes/streams', icon: CURRICULUM_STREAM_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
