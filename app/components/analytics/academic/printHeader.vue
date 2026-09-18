<script setup lang="ts">
const props = defineProps<{
  sectionTitle: string
  termLabel: string
  scopeLabel: string
  subjectLabel?: string
  levelLabel?: string
}>()

const { school } = useSchoolInfo()
const logoSrc = ref('')
const schoolName = computed(() => school.value?.name || 'Skultem')

onMounted(async () => {
  const assets = await SchoolApi().getBrandingAssets()
  logoSrc.value = assets?.logo || school.value?.logo || ''
})
</script>

<template>
  <div class="mb-4 border-b-4 border-primary-500 px-6 pb-5 pt-6 text-center sm:px-8 sm:pt-8">
    <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-16 object-contain" alt="School logo">
    <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
    <p class="mt-1 text-sm font-semibold text-gray-600">Academic Report &middot; {{ sectionTitle }}</p>
    <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
      <span>Term: {{ termLabel }}</span>
      <span>Scope: {{ scopeLabel }}</span>
      <span v-if="subjectLabel">Subject: {{ subjectLabel }}</span>
      <span v-if="levelLabel">Level: {{ levelLabel }}</span>
    </div>
    <p class="mt-2 text-[10px] uppercase tracking-widest text-emerald-600">
      Based on approved assessment results only
    </p>
  </div>
</template>
