<template>
  <div v-if="isSectionBased && sections.length" class="mt-4 space-y-2">
    <div>
      <p class="text-sm font-medium text-highlighted">By section</p>
      <p class="text-xs text-muted">
        Each section can choose its own approver - for example, class masters in Primary and the exam officer in
        Secondary. Changes save straight away.
      </p>
    </div>

    <div class="divide-y divide-default rounded-lg border border-default">
      <div v-for="section in sections" :key="section.id"
        class="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-medium text-highlighted">{{ section.name }}</p>
          <p class="truncate text-xs text-muted">{{ section.levels.map(levelLabel).join(' • ') || 'No levels yet' }}</p>
        </div>
        <USelectMenu :model-value="section.gradeApprover ?? 'INHERIT'" :items="options" value-key="value"
          label-key="label" class="w-full sm:w-64" :loading="savingId === section.id"
          :disabled="!!savingId" @update:model-value="(v: string) => save(section, v)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Per-section "Who approves grades?" right under the school's own choice, so a section-based school sets it all in
// one place (the same setting is also on each section's Branding tab).
const props = defineProps<{ schoolApprover?: string }>()

const { structure, isSectionBased, load, set } = useSchoolStructure()
const { load: reloadRouting } = useGradeApproval()
const { success, error: toastError } = useNotify()
const savingId = ref('')

const sections = computed(() => structure.value?.sections ?? [])

const options = computed(() => [
  {
    label: `Same as the school (${GRADE_APPROVER_LABEL[(props.schoolApprover as GradeApprover) ?? 'CLASS_MASTER']?.toLowerCase() ?? 'class master'})`,
    value: 'INHERIT'
  },
  { label: 'The class master', value: 'CLASS_MASTER' },
  { label: 'An admin', value: 'ADMIN' },
  { label: 'The exam officer', value: 'EXAM_OFFICER' },
])

async function save(section: ManagementSectionView, value: string) {
  if ((section.gradeApprover ?? 'INHERIT') === value) return
  savingId.value = section.id
  try {
    const res = await SchoolApi().updateSectionGradeApprover(section.id,
      value === 'INHERIT' ? null : value as GradeApprover)
    if (!res) return
    set(res)
    // The grades screens read who approves from here - refresh it so they reflect the change at once.
    reloadRouting(true)
    success(`${section.name}: grades are now approved by ${value === 'INHERIT'
      ? 'the same person as the rest of the school'
      : `the ${GRADE_APPROVER_LABEL[value as GradeApprover].toLowerCase()}`}`)
  } catch (err: any) {
    toastError(err?.message || `Couldn't update ${section.name}`)
  } finally {
    savingId.value = ''
  }
}

onMounted(() => { load() })
</script>
