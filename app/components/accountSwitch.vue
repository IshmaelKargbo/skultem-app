<template>
    <USelectMenu v-if="canSwitchYear" v-model="viewingYearId" value-key="value" :items="yearOptions" />
</template>

<script lang="ts" setup>
const store = useAcademicYearStore()
const { records: academicYears, viewingYear } = storeToRefs(store)
const { can } = useAuth()

const yearOptions = computed(() =>
    academicYears.value.map((year) => ({
        value: year.id,
        label: year.active ? `${year.name} (Active)` : year.name,
        icon: year.active ? 'i-lucide-circle-check' : year.status === 'CLOSED' ? 'i-lucide-lock' : 'i-lucide-clock'
    }))
)

const canSwitchYear = computed(() => can([Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]))

const viewingYearId = computed({
    get: () => viewingYear.value?.id ?? undefined,
    set: (id: string | null) => store.setViewingYear(id)
})

</script>