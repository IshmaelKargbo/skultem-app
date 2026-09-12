<template>
  <!-- Quick-nav across the Subjects pages, same Tab/TabMobile pair used for Fees & Payments,
       Classes, and student/teacher profiles. Each item gated by that page's own definePageMeta
       roles. -->
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
  { label: 'Subjects', to: '/subjects', icon: SUBJECT_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] },
  { label: 'Teacher Assignment', to: '/subjects/teacher-assignment', icon: TEACHER_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },
  { label: 'Subject Groups', to: '/subjects/subject-groups', icon: CURRICULUM_GROUP_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] },
  { label: 'Class Subjects', to: '/subjects/class-subjects', icon: BOOK_OPEN_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] },
  { label: 'Stream Subjects', to: '/subjects/stream-subjects', icon: BOOK_OPEN_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
