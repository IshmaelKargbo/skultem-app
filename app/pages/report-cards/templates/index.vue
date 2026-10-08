<template>
  <div class="space-y-4 px-4 md:px-6">
    <ReportCardSectionNav />

    <!-- Header -->
    <Heading title="Report Card Design" subtitle="Configure the report card layout used across your school.">
      <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/report-cards" class="justify-center">
        Back
      </UButton>

      <UButton icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" @click="save">
        Save Settings
      </UButton>
    </Heading>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Sections
              </h3>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            Choose which sections appear on generated report cards.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <label v-for="section in sections" :key="section.key"
              class="flex items-start gap-3 rounded-xl border border-default p-3.5 cursor-pointer transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="settings[section.key]" class="mt-0.5"
                @update:model-value="(value) => (settings[section.key] = !!value)" />

              <div class="flex items-start gap-2.5">
                <UIcon :name="section.icon" class="size-4 mt-0.5 shrink-0 text-muted" />
                <div>
                  <p class="text-sm font-medium">{{ section.label }}</p>
                  <p class="text-xs text-muted">{{ section.hint }}</p>
                </div>
              </div>
            </label>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square-text" class="size-5 text-primary" />
                <h3 class="font-semibold">
                  Remarks by Score Range
                </h3>
              </div>

              <UButton v-if="!settings.remarkScale.length" size="xs" variant="soft" icon="i-lucide-wand-sparkles"
                @click="useSuggestedRemarks">
                Use suggested
              </UButton>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            The remark is picked from the student's average, so teachers don't have to write "very good" on every
            card. The class master can still add their own remark on top.
          </p>

          <div v-if="settings.remarkScale.length" class="space-y-3">
            <div v-for="(band, i) in settings.remarkScale" :key="i"
              class="grid grid-cols-[4.5rem_4.5rem_1fr_auto] items-start gap-2 sm:gap-3">
              <UInput v-model.number="band.minScore" type="number" :min="0" :max="100" placeholder="From"
                aria-label="From score" />
              <UInput v-model.number="band.maxScore" type="number" :min="0" :max="100" placeholder="To"
                aria-label="To score" />
              <UInput v-model="band.remark" placeholder="e.g. Excellent work, keep it up" aria-label="Remark" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Remove range"
                @click="settings.remarkScale.splice(i, 1)" />
            </div>

            <p v-if="remarkScaleError" class="text-sm text-error">{{ remarkScaleError }}</p>
          </div>

          <p v-else class="text-sm text-muted">No ranges yet - cards only show what the teacher writes.</p>

          <UButton class="mt-4" size="sm" variant="outline" icon="i-lucide-plus" @click="addRemarkBand">
            Add range
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Theme
              </h3>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Header Color">
              <div class="flex items-center gap-3">
                <UInput v-model="settings.headerColor" type="color" class="h-10 w-14 shrink-0 p-1" />
                <UInput v-model="settings.headerColor" placeholder="#1878c5" class="w-full font-mono text-sm" />
              </div>
            </UFormField>

            <UFormField label="Logo URL">
              <UInput v-model="settings.logoUrl" placeholder="https://..." icon="i-lucide-image" class="w-full" />
            </UFormField>

            <UFormField label="Footer Note" class="sm:col-span-2">
              <UInput v-model="settings.footerNote" placeholder="e.g. Property of King's West International School"
                class="w-full" />
            </UFormField>
          </div>
        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Live Preview
              </h3>
            </div>
          </template>

          <div class="p-5">
            <div class="overflow-hidden rounded-xl border border-default"
              :style="{ borderTopColor: settings.headerColor, borderTopWidth: '4px' }">

              <div class="bg-muted/40 p-6 text-center">
                <img v-if="settings.logoUrl" :src="settings.logoUrl" class="h-14 mx-auto object-contain" alt="Logo">

                <div v-else class="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-muted">
                  <UIcon name="i-lucide-image" class="size-6 text-muted" />
                </div>

                <h3 class="mt-3 font-bold">
                  Report Card
                </h3>

                <p class="text-xs text-muted">
                  Preview of the active design
                </p>
              </div>

              <div class="space-y-2 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-muted">
                  Includes
                </p>

                <div v-if="activeSections.length" class="flex flex-wrap gap-1.5">
                  <UBadge v-for="section in activeSections" :key="section.key" color="neutral" variant="subtle"
                    size="sm">
                    {{ section.label }}
                  </UBadge>
                </div>

                <p v-else class="text-xs text-muted">
                  No sections selected yet.
                </p>
              </div>
            </div>
          </div>
        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const router = useRouter()
const store = useReportCardSettingStore()
const { settings } = storeToRefs(store)

const saving = ref(false)

interface SectionConfig {
  key: 'showAttendance' | 'showRemarks' | 'showPosition' | 'showTeacherSignature' | 'showPrincipalSignature' | 'showGradeScale'
  label: string
  hint: string
  icon: string
}

const sections: SectionConfig[] = [
  {
    key: 'showAttendance',
    label: 'Attendance',
    hint: 'Attendance percentage for the term',
    icon: 'i-lucide-calendar-check'
  },
  {
    key: 'showRemarks',
    label: 'Teacher Remarks',
    hint: 'Comments from the class teacher',
    icon: 'i-lucide-message-square'
  },
  {
    key: 'showPosition',
    label: 'Class Position',
    hint: 'Student rank within the class',
    icon: 'i-lucide-trophy'
  },
  {
    key: 'showTeacherSignature',
    label: 'Class Teacher Signature',
    hint: 'Signature line for the class teacher',
    icon: 'i-lucide-signature'
  },
  {
    key: 'showPrincipalSignature',
    label: 'Principal Signature',
    hint: "Signature line for the principal, with the school's saved signature",
    icon: 'i-lucide-pen-line'
  },
  {
    key: 'showGradeScale',
    label: 'Grade Scale',
    hint: 'Reference table for grade meanings',
    icon: 'i-lucide-list-ordered'
  }
]

const activeSections = computed(() => sections.filter(section => settings.value[section.key]))

function addRemarkBand() {
  const last = [...settings.value.remarkScale].sort((a, b) => b.maxScore - a.maxScore)[0]
  const from = last ? Math.min(last.maxScore + 1, 100) : 0
  settings.value.remarkScale.push({ minScore: from, maxScore: 100, remark: '' })
}

function useSuggestedRemarks() {
  settings.value.remarkScale = [
    { minScore: 0, maxScore: 39, remark: 'Needs urgent support. Please work closely with the teachers to improve.' },
    { minScore: 40, maxScore: 49, remark: 'Below average. More effort and regular practice are needed.' },
    { minScore: 50, maxScore: 59, remark: 'Fair performance. With more focus, there is room to improve.' },
    { minScore: 60, maxScore: 69, remark: 'Good performance. Keep working hard.' },
    { minScore: 70, maxScore: 79, remark: 'Very good performance. Keep it up.' },
    { minScore: 80, maxScore: 100, remark: 'Excellent performance. Keep up the outstanding work.' }
  ]
}

// Mirrors the server's rules so a mistake shows before Save, not as a failed request.
const remarkScaleError = computed(() => {
  const bands = [...settings.value.remarkScale].sort((a, b) => a.minScore - b.minScore)
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i]!
    if (!b.remark.trim()) return 'Every range needs a remark.'
    if (!Number.isInteger(b.minScore) || !Number.isInteger(b.maxScore) || b.minScore < 0 || b.maxScore > 100)
      return 'Ranges must be whole scores between 0 and 100.'
    if (b.minScore > b.maxScore) return 'A range can\'t start above where it ends.'
    if (i > 0 && b.minScore <= bands[i - 1]!.maxScore) return 'Ranges can\'t overlap.'
  }
  return ''
})

async function save() {
  if (remarkScaleError.value) {
    notifyError(remarkScaleError.value)
    return
  }

  saving.value = true
  try {
    await store.save()
    success('Report card settings saved')
    router.push('/report-cards')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save report card settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Report Card Design')
  await store.fetch()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
