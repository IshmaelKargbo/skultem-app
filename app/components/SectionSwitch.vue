<script setup lang="ts">
defineProps<{ compact?: boolean }>()

const { canSwitch, sections, viewingSectionId, setViewingSection } = useSectionView()

const ALL = '__all__'
const options = computed(() => [
    { label: 'All sections', value: ALL, icon: 'i-lucide-school' },
    ...sections.value.map(s => ({ label: s.name, value: s.id, icon: 'i-lucide-users-round' }))
])

const selected = computed({
    get: () => viewingSectionId.value ?? ALL,
    set: (v: string) => setViewingSection(v === ALL ? null : v)
})
</script>

<template>
    <USelectMenu v-if="canSwitch" v-model="selected" value-key="value" :items="options"
        :size="compact ? 'sm' : 'xl'" :ui="{ base: viewingSectionId ? 'ring-primary' : '' }"
        :class="compact ? 'w-44' : 'w-full md:min-w-60'" aria-label="Section view"
        :color="viewingSectionId ? 'primary' : 'neutral'" />
</template>
