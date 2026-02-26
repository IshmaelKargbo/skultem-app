<template>
    <div>
        <div class="space-y-2">
            <p class="text-3xl">Settings</p>
            <p class="font-light text-mute">Configure system settings</p>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Academic Years', to: '/settings', exact: true },
                { label: 'Terms', to: '/settings/terms' },
                { label: 'Fee Categories', to: '/settings/fee-categories' },
                { label: 'Holidaies', to: '/settings/holidaies' }
            ]" />
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped></style>