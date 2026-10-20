<template>
  <div class="px-6">
    <div class="md:mx-auto md:max-w-3xl
        
        rounded-4xl
        border border-white/50
        bg-white/10
        p-1
        shadow-[0_8px_32px_rgba(15,23,42,0.10),0_1px_0_rgba(255,255,255,0.7)_inset]
        backdrop-blur-[3px]
        backdrop-saturate-150
        dark:border-white/10
        dark:bg-gray-950/55
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.06)_inset]
      ">
      <ul ref="list" class="relative grid gap-1.5" :style="{
        gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))`
      }">
        <!-- One highlight that slides from the tab you were on to the one you are on -->
        <span v-if="pill" aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 left-0 rounded-3xl bg-primary-500/90 shadow-lg shadow-primary-500/20 ring-1 ring-white/20 backdrop-blur-xl dark:bg-primary-500/85 motion-reduce:transition-none"
          :class="animate ? 'transition-[transform,width] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]' : ''"
          :style="{ width: `${pill.width}px`, transform: `translateX(${pill.left}px)` }" />

        <li v-for="item in visibleItems" :key="item.to" :ref="el => setItem(item.to, el as HTMLElement | null)" class="relative">
          <NuxtLink :to="item.to" class="
              flex min-h-15 flex-col items-center justify-center
              gap-1 rounded-3xl
              transition-colors duration-200 ease-out
              active:scale-95
              motion-reduce:transition-none
            " :class="isActive(item.to, item.exact)
                ? 'font-semibold text-white'
                : 'text-gray-500 hover:bg-white/40 hover:text-primary dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-primary-300'
              " :aria-current="isActive(item.to, item.exact) ? 'page' : undefined
              ">
            <UIcon :name="item.icon" class="text-lg" />

            <span class="max-w-full truncate text-[10px] leading-none">
              {{ item.label }}
            </span>
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
  adminPortalOnly?: boolean
}

const { can } = useAuth()
const { isPathAvailable } = useModules()
const route = useRoute()
const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

// One entry per bottom-nav icon. Omit `roles` for items visible to everyone.
const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: DASHBOARD_ICON, exact: true },

  {
    label: 'Grades', to: '/grades', icon: GRADES_ICON, exact: true,
    roles: [Role.PARENT, Role.TEACHER]
  },

  {
    label: 'Students', to: '/students', icon: STUDENT_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.OWNER]
  },

  {
    label: 'Classes', to: '/classes', icon: CLASS_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.OWNER]
  },

  {
    label: 'Teachers', to: '/teachers', icon: TEACHER_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.OWNER]
  },

  {
    label: 'Fees', to: '/fees', icon: PAYMENT_ICON,
    roles: [Role.PARENT, Role.TEACHER]
  },

  {
    label: 'Attendance', to: '/attendance', icon: ATTENDANCE_ICON,
    roles: [Role.PARENT, Role.TEACHER]
  },

  {
    label: 'Payments', to: '/fees-payment/pay', icon: 'i-lucide-wallet',
    roles: [Role.ACCOUNTANT]
  },

  {
    label: 'Transactions', to: '/transactions', icon: 'i-lucide-book-open',
    roles: [Role.ACCOUNTANT]
  },

  {
    label: 'Reports', to: '/analytics/financial-reports', icon: 'i-lucide-bar-chart-3',
    roles: [Role.ACCOUNTANT]
  },

  // System-admin portal only - same pages as the desktop sidebar (see menu/index.vue).
  {
    label: 'Schools', to: '/schools', icon: SCHOOL_ICON,
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },

  {
    label: 'Calendar', to: '/calendar', icon: 'i-lucide-calendar-range',
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },

  {
    label: 'Admins', to: '/users', icon: USERS_ICON,
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },
]

const visibleItems = computed(() =>
  navItems
    // Same rule as the desktop sidebar (menu/index.vue): the admin subdomain shows the system-admin
    // items regardless of the resolved role.
    .filter((item) => onAdminPortal
      ? item.adminPortalOnly || !item.roles
      : (!item.roles || can(item.roles)) && !item.adminPortalOnly)
    // Nothing for a module this school hasn't installed (see utils/modules.ts).
    .filter((item) => isPathAvailable(item.to))
)

// The sliding highlight: measured from the active tab, so it follows any number of tabs and any screen width.
const list = ref<HTMLElement | null>(null)
const itemEls = new Map<string, HTMLElement>()
const pill = ref<{ left: number, width: number } | null>(null)
const animate = ref(false)

function setItem(to: string, el: HTMLElement | null) {
  if (el) itemEls.set(to, el)
  else itemEls.delete(to)
}

function placePill() {
  const active = visibleItems.value.find(i => isActive(i.to, i.exact))
  const el = active && itemEls.get(active.to)
  pill.value = el ? { left: el.offsetLeft, width: el.offsetWidth } : null
}

onMounted(() => {
  nextTick(() => {
    placePill()
    // Only animate moves after the first placement, so it does not slide in from the left on load.
    requestAnimationFrame(() => { animate.value = true })
  })
  window.addEventListener('resize', placePill)
})
onBeforeUnmount(() => window.removeEventListener('resize', placePill))
watch(() => route.path, () => nextTick(placePill))
watch(visibleItems, () => nextTick(placePill))

function isActive(to: string, exact = false) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>