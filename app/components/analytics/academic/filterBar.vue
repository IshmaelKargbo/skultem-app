<script setup lang="ts">
defineProps<{
  filters: { termId: string, level: string, classId: string, subjectId: string }
  terms: { label: string, value: string }[]
  classOptions: { label: string, value: string }[]
  subjectOptions: { label: string, value: string }[]
  levelOptions: { label: string, value: string }[]
  classLoading?: boolean
  subjectLoading?: boolean
}>()

</script>

<template>
  <UCard>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UFormField label="Term">
        <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label" class="w-full" />
      </UFormField>

      <UFormField label="Level">
        <USelectMenu v-model="filters.level" :items="levelOptions" value-key="value" label-key="label"
          placeholder="All levels" class="w-full" />
      </UFormField>

      <UFormField label="Class">
        <USelectMenu v-model="filters.classId" :items="classOptions" :loading="classLoading" value-key="value"
          label-key="label" placeholder="Whole school" class="w-full" />
      </UFormField>

      <UFormField label="Subject">
        <USelectMenu v-model="filters.subjectId" :items="subjectOptions" :loading="subjectLoading"
          value-key="value" label-key="label" placeholder="All subjects" class="w-full" />
      </UFormField>
    </div>
  </UCard>
</template>
