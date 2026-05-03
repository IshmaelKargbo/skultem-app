<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Halidaies" subtitle="Scheduled school breaks">
            <SettingsHolidayAdd />
        </Heading>
        <SettingsHolidayTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Settings')
    document.title = 'Holidays | Settings | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
