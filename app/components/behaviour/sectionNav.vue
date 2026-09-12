<template>
  <template v-if="items.length > 1">
    <TabMobile class="md:hidden" :tabs="items" />
    <Tab class="hidden md:block" :tabs="items" />
  </template>
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
  { label: 'Behaviours', to: '/behaviours', icon: BEHAVIOUR_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] },
  { label: 'Category', to: '/behaviours/category', icon: CATEGORY_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
