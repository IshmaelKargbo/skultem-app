<template>
    <div>
        <div class="space-y-2">
            <p class="text-2xl font-semibold tracking-tight text-slate-900">Settings</p>
            <p class="text-sm text-mute">Configure system settings</p>
        </div>
        <div class="mt-5 flex">
            <Tab v-if="can([Role.SCHOOL_ADMIN])" :tabs="[
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
                { label: 'Fee Categories', to: '/settings/fee-categories' }
            ]" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
