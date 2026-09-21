<script setup lang="ts">
const props = defineProps<{
  classOptions: { label: string; value: string }[]
  sortOptions: { label: string; value: string }[]
  activeCount: number
  defaultSort: string
}>()

const classId = defineModel<string>('classId', { required: true })
const gender = defineModel<string>('gender', { required: true })
const sort = defineModel<string>('sort', { required: true })

const open = ref(false)
const draftClassId = ref(classId.value)
const draftGender = ref(gender.value)
const draftSort = ref(sort.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftClassId.value = classId.value
  draftGender.value = gender.value
  draftSort.value = sort.value
})

const draftIsDefault = computed(() => !draftClassId.value && !draftGender.value && draftSort.value === props.defaultSort)

function clearDraft() {
  draftClassId.value = ''
  draftGender.value = ''
  draftSort.value = props.defaultSort
}

function apply() {
  classId.value = draftClassId.value
  gender.value = draftGender.value
  sort.value = draftSort.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter students"
    description="Narrow the list by class, gender or sort order">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 md:flex-row">
        <UFormField label="Class" class="md:flex-1">
          <USelectMenu v-model="draftClassId" value-key="value" label-key="label" :items="classOptions"
            placeholder="All Classes" clear class="w-full" />
        </UFormField>
        <UFormField label="Gender" class="md:flex-1">
          <USelectMenu v-model="draftGender" value-key="value" label-key="label" :items="genderOption"
            placeholder="All Genders" clear class="w-full" />
        </UFormField>
        <UFormField label="Sort by" class="md:flex-1">
          <USelectMenu v-model="draftSort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by"
            class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="grid grid-cols-2 gap-2 w-full md:flex md:justify-end border-t pt-3 border-default">
        <UButton :icon="DELETE_ICON" class="justify-center md:min-w-32" variant="outline" color="error" label="Clear"
          :disabled="draftIsDefault" @click="clearDraft" />
        <UButton color="primary" label="Apply" class="justify-center md:min-w-32" @click="apply" />
      </div>
    </template>
  </UDrawer>
</template>
