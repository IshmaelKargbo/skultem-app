<template>
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
  roles?: Role[]
}

const allItems: NavItem[] = [
  { label: 'Fees', to: '/fees-payment', icon: STUDENT_FEES_ICON, exact: true },
  { label: 'Payments', to: '/fees-payment/pay', icon: PAYMENT_ICON },
  { label: 'Reports', to: '/fees-payment/reports', icon: 'i-lucide-layout-dashboard' },
  { label: 'Discounts', to: '/fees-payment/discounts', icon: DISCOUNT_ICON },
  { label: 'Structures', to: '/fees-payment/structure', icon: FEE_STRUCTURE_ICON },
  { label: 'Category', to: '/fees-payment/category', icon: CATEGORY_ICON },
  {
    label: 'Receipt Design', to: '/fees-payment/receipt-design', icon: SETTINGS_ICON,
    roles: [Role.PROPRIETOR, Role.OWNER]
  }
]

const items = computed(() => allItems.filter(item => !item.roles || can(item.roles)))
</script>
