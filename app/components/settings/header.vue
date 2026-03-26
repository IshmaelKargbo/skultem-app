<template>
    <div>
        <Heading :title="title" :subtitle="subtitle">
            <slot />
        </Heading>
        <div class="my-6 flex">
            <Tab v-if="can([Role.ADMIN, Role.PROPRIETOR])" :tabs="[
                { label: 'Academic Years', to: '/settings', exact: true },
                { label: 'Terms', to: '/settings/terms' },
                { label: 'Assessment Templates', to: '/settings/assessment-templates' },
                { label: 'Assessment Cycle', to: '/settings/assessment-cycle' },
                { label: 'Fee Categories', to: '/settings/fee-categories' },
                { label: 'Behavoiur Categories', to: '/settings/behaviour-categories' },
                { label: 'Holidaies', to: '/settings/holidaies' },
                { label: 'Audit Logs', to: '/settings/audit' },
                { label: 'User Sessions', to: '/settings/sessions' }
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
