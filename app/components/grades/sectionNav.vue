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
  { label: 'Grade Assignment', to: '/grades', icon: GRADES_ASSIGN_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT] },
  { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON, roles: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR, Role.OWNER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
