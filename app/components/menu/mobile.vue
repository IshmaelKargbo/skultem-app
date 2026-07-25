<template>
  <div class="px-5 pt-2" style="padding-bottom: max(0.1rem, env(safe-area-inset-bottom));">
    <div class="rounded-4xl border border-gray-200 bg-white/95 p-1 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
      <ul
        class="grid gap-1.5"
        :style="{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }"
      >
        <li v-for="item in visibleItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="menu-mobile-item"
            :class="isActive(item.to, item.exact)"
            :aria-current="isActive(item.to, item.exact) ? 'page' : undefined"
          >
            <UIcon class="text-lg" :name="item.icon" />
            <span class="menu-mobile-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  roles?: Role[]
}

const { can } = useAuth()
const route = useRoute()

// One entry per bottom-nav icon. Omit `roles` for items visible to everyone.
const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: DASHBOARD_ICON, exact: true },

  { label: 'Grades', to: '/grades', icon: GRADES_ICON, exact: true,
    roles: [Role.PARENT, Role.TEACHER] },

  { label: 'Students', to: '/students', icon: STUDENT_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },

  { label: 'Classes', to: '/classes', icon: CLASS_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },

  { label: 'Teachers', to: '/teachers', icon: TEACHER_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },

  { label: 'Fees', to: '/fees', icon: PAYMENT_ICON,
    roles: [Role.PARENT, Role.TEACHER] },

  { label: 'Attendance', to: '/attendance', icon: ATTENDANCE_ICON,
    roles: [Role.PARENT, Role.TEACHER] },

  { label: 'Payments', to: '/fees-payment/pay', icon: 'i-lucide-wallet',
    roles: [Role.ACCOUNTANT] },

  { label: 'Transactions', to: '/transactions', icon: 'i-lucide-book-open',
    roles: [Role.ACCOUNTANT] },

  { label: 'Reports', to: '/analytics/financial-reports', icon: 'i-lucide-bar-chart-3',
    roles: [Role.ACCOUNTANT] },
]

const visibleItems = computed(() =>
  navItems.filter((item) => !item.roles || can(item.roles))
)

function isActive(to: string, exact = false) {
  const active = exact ? route.path === to : route.path.startsWith(to)
  return active ? 'menu-mobile-item-active' : ''
}
</script>

<style scoped>
.menu-mobile-item {
  display: flex;
  min-height: 60px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 40px;
  color: #4b5563;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.menu-mobile-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #1878c5;
}

.menu-mobile-item:active {
  transform: scale(0.94);
}

.menu-mobile-item-active {
  background: rgba(99, 102, 241, 0.12);
  color: #1878c5;
  font-weight: 600;
}

.menu-mobile-label {
  max-width: 100%;
  font-size: 10px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .menu-mobile-item {
  color: #d1d5db;
}

.dark .menu-mobile-item:hover {
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
}

.dark .menu-mobile-item-active {
  background: rgba(99, 102, 241, 0.24);
  color: #c7d2fe;
}

@media (prefers-reduced-motion: reduce) {
  .menu-mobile-item {
    transition: none !important;
  }
}
</style>