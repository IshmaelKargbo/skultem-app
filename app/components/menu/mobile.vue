<template>
  <div class="px-3 ">
    <div
      class="rounded-4xl border border-white/60 bg-white dark:bg-gray-800 p-1 shadow-[0_8px_32px_rgba(15,23,42,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:from-gray-900/70 dark:to-gray-950/60 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06)_inset]"
    >
      <ul
        class="grid gap-1.5"
        :style="{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }"
      >
        <li v-for="item in visibleItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-3xl text-gray-600 transition-all duration-200 ease-out active:scale-95 motion-reduce:transition-none dark:text-gray-300"
            :class="isActive(item.to, item.exact)
              ? 'bg-primary-100 dark:bg-primary-500 text-white font-semibold shadow'
              : 'hover:bg-white/50 hover:text-primary dark:hover:bg-white/8 dark:hover:text-primary-300'"
            :aria-current="isActive(item.to, item.exact) ? 'page' : undefined"
          >
            <UIcon class="text-lg" :name="item.icon" />
            <span class="max-w-full truncate text-[10px] leading-none">{{ item.label }}</span>
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

// `startsWith(to)` with no boundary would let '/fees' match '/fees-payment/pay'.
// Require an exact match or a '/' right after `to` so sibling routes that
// merely share a prefix (e.g. /fees vs /fees-payment) don't both light up.
function isActive(to: string, exact = false) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>