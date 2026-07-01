<template>
  <div class="px-3 pb-3 pt-2">
    <div class="rounded-4xl border border-gray-200 bg-white/95 p-1 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
      <ul class="grid grid-cols-4 gap-1.5">
        <li>
          <NuxtLink to="/" class="menu-mobile-item" :class="isActive('/', true)">
            <UIcon class="text-xl" :name="DASHBOARD_ICON" />
            <span class="menu-mobile-label">Home</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.PARENT, Role.TEACHER])">
          <NuxtLink to="/grades" class="menu-mobile-item" :class="isActive('/grades', true)">
            <UIcon class="text-xl" :name="GRADES_ICON" />
            <span class="menu-mobile-label">Grades</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <NuxtLink to="/students" class="menu-mobile-item" :class="isActive('/students')">
            <UIcon class="text-xl" :name="STUDENT_ICON" />
            <span class="menu-mobile-label">Students</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <NuxtLink to="/classes" class="menu-mobile-item" :class="isActive('/classes')">
            <UIcon class="text-xl" :name="CLASS_ICON" />
            <span class="menu-mobile-label">Classes</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <NuxtLink to="/teachers" class="menu-mobile-item" :class="isActive('/teachers')">
            <UIcon class="text-xl" :name="TEACHER_ICON" />
            <span class="menu-mobile-label">Teachers</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.PARENT, Role.TEACHER])">
          <NuxtLink to="/fees" class="menu-mobile-item" :class="isActive('/fees')">
            <UIcon class="text-xl" :name="PAYMENT_ICON" />
            <span class="menu-mobile-label">Fees</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.PARENT, Role.TEACHER])">
          <NuxtLink to="/attendance" class="menu-mobile-item" :class="isActive('/attendance')">
            <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
            <span class="menu-mobile-label">Attendance</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.ACCOUNTANT])">
          <NuxtLink to="/fees-payment/pay" class="menu-mobile-item" :class="isActive('/fees-payment/pay')">
            <UIcon name="i-lucide-wallet" class="text-xl" />
            <span class="menu-mobile-label">Payments</span>
          </NuxtLink>
        </li>
        <li v-if="can([Role.ACCOUNTANT])">
          <NuxtLink to="/transactions" class="menu-mobile-item" :class="isActive('/transactions')">
            <UIcon name="i-lucide-book-open" class="text-xl" />
            <span class="menu-mobile-label">Transactions</span>
          </NuxtLink>
        </li>

        <li v-if="can([ Role.ACCOUNTANT])">
          <NuxtLink to="/analytics/financial-reports" class="menu-mobile-item" :class="isActive('/analytics/financial-reports')">
            <UIcon name="i-lucide-bar-chart-3" class="text-xl" />
            <span class="menu-mobile-label">Reports</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const route = useRoute()

function isActive(to: string, exact = false) {
  return exact
    ? route.path === to
      ? 'menu-mobile-item-active'
      : ''
    : route.path.startsWith(to)
      ? 'menu-mobile-item-active'
      : ''
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
  border-radius:  40px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.menu-mobile-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.menu-mobile-item-active {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 600;
}

.menu-mobile-label {
  max-width: 100%;
  font-size: 11px;
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
</style>
