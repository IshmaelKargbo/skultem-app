<script setup lang="ts">
// "Who is this for?" on a notice, calendar event or broadcast, in a school run in management sections.
//   * whole-school staff pick Whole school or any one section;
//   * a section-limited Admin/Teacher can only address their own section(s) - with exactly one it is fixed
//     (and shown as such), with several they choose;
//   * once posted, the audience can't be changed (`locked`) - shown as a label instead.
// Renders nothing in a school without sections. v-model is the section id, '' meaning the whole school.
const model = defineModel<string>({ default: '' })
const props = defineProps<{ locked?: boolean, disabled?: boolean }>()

const { structure, load, isSectionBased } = useSchoolStructure()
const { scope, load: loadScope } = useMyScope()

// Reka's select can't hold an empty-string value, so "whole school" is a sentinel inside this component.
const WHOLE = '__whole__'

const wholeSchoolCaller = computed(() => !scope.value || scope.value.wholeSchool)

const mySections = computed(() => {
  const all = structure.value?.sections ?? []
  return wholeSchoolCaller.value ? all : all.filter(s => scope.value!.sectionIds.includes(s.id))
})

const options = computed(() => [
  ...(wholeSchoolCaller.value ? [{ label: 'Whole school', value: WHOLE, description: 'Everyone in the school' }] : []),
  ...mySections.value.map(s => ({ label: s.name, value: s.id, description: `${s.name} only` }))
])

const selected = computed({
  get: () => model.value || (wholeSchoolCaller.value ? WHOLE : mySections.value[0]?.id ?? ''),
  set: (v: string) => { model.value = v === WHOLE ? '' : v }
})

const lockedName = computed(() => model.value
  ? structure.value?.sections.find(s => s.id === model.value)?.name ?? 'a section'
  : 'Whole school')

// A section-limited caller with one section is always posting to it - set it, no choice to make.
const onlyOne = computed(() => !wholeSchoolCaller.value && mySections.value.length === 1)

onMounted(async () => {
  await Promise.all([load(), loadScope()])
  if (!props.locked && !wholeSchoolCaller.value && !model.value && mySections.value.length) {
    model.value = mySections.value[0]!.id
  }
})
</script>

<template>
  <UFormField v-if="isSectionBased" label="Who is this for?" name="managementSectionId">
    <div v-if="locked" class="flex items-center gap-2 text-sm">
      <UIcon name="i-lucide-users-round" class="size-4 text-muted" />
      <span>{{ lockedName }}</span>
      <span class="text-xs text-muted">(can't be changed after posting)</span>
    </div>

    <div v-else-if="onlyOne" class="flex items-center gap-2 text-sm">
      <UIcon name="i-lucide-users-round" class="size-4 text-muted" />
      <span>{{ mySections[0]?.name }} only</span>
      <span class="text-xs text-muted">- your section</span>
    </div>

    <USelectMenu v-else v-model="selected" value-key="value" :items="options" icon="i-lucide-users-round"
      :disabled="disabled" class="w-full" />
  </UFormField>
</template>
