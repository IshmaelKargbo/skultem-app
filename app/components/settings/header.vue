<template>
    <div>
        <Heading :title="title" :subtitle="subtitle">
            <slot />
        </Heading>
        <div class="my-6 flex">
            <Tab v-if="can([Role.ADMIN, Role.PROPRIETOR])" :tabs="[
                { label: 'Fee Categories', to: '/settings' },
                { label: 'Expense Categories', to: '/settings/expense-categories' },
                { label: 'Behavoiur Categories', to: '/settings/behaviour-categories' },
                { label: 'Holidaies', to: '/settings/holidaies' }
            ]" />
            <Tab v-if="can([Role.ACCOUNTANT])" :tabs="[
                { label: 'Fee Categories', to: '/settings/fee-categories' },
                { label: 'Expense Categories', to: '/settings/expense-categories' }
            ]" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { subtitle, title } = defineProps<{
    title: string
    subtitle: string
}>()

const { can } = useAuth()
</script>
