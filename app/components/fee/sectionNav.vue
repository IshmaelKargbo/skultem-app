<template>
  <!-- Shared quick-nav across every Fees & Payments page - mirrors the sidebar's own "Fees &
       Payments" group so hopping between Fees/Payments/Structures/Discounts/Category/Receipt
       Design doesn't mean going back to the sidebar every time. Uses the app's own Tab/TabMobile
       pair (same as teacher/student profiles, analytics, report headers) rather than a one-off
       nav bar, so it looks and behaves like every other section switcher in the app. -->
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
