<template>
  <div class="space-y-3 px-4 md:px-6">
    <div data-guide="rc-tabs"><ReportCardSectionNav /></div>

    <!-- Header -->
    <Heading title="Report Card Design" subtitle="Configure the report card layout used across your school.">
      <GuideBar topic="admin-report-design" />
      <UButton data-guide="rcd-save" icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" @click="save">
        Save Settings
      </UButton>
    </Heading>

    
    <DesignSkeleton v-if="fetching" />
    <div v-show="!fetching" class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

        <!-- The M-Compose design the PDFs are printed with (only when the server has the document service). -->
        <UCard v-if="documentService.status.value?.enabled">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-template" class="size-5 text-primary" />
              <h3 class="font-semibold">Print design</h3>
            </div>
            <p class="mt-1 text-sm text-muted">
              The layout report cards are printed in. What each design shows, and its parts you can show or hide,
              are set on Data Links.
            </p>
          </template>
          <!-- One design for every level, or a separate one for a level (Primary, JSS...) when the school wants it. -->
          <UTabs v-if="levelTabs.length > 1" v-model="designTab" :items="levelTabs" :content="false" size="sm"
            class="mb-3 w-full" />
          <p v-if="designTab !== 'ALL'" class="mb-2 text-xs text-muted">
            {{ levelLabel(designTab) }} report cards use this design. Choose "Use the general design" to go back to the
            one for all levels.
          </p>
          <DocumentDesignPicker :key="designTab" kind="report-card" links-page="/report-cards/data-links"
            :level="designTab === 'ALL' ? null : designTab"
            :default-label="designTab === 'ALL' ? 'the default' : 'the general design'" @saved="previewVersion++" />
        </UCard>

        <UCard data-guide="rcd-remarks">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square-text" class="size-5 text-primary" />
                <h3 class="font-semibold">
                  Remarks by Score Range
                </h3>
              </div>

              <UButton size="xs" variant="soft" icon="i-lucide-rotate-ccw" @click="useSuggestedRemarks">
                Restore defaults
              </UButton>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            The remark is picked from the student's average, so teachers don't have to write "very good" on every
            card. We start you with a default set - change any range or remark, or delete the ones you don't want. The
            class master can still add their own remark on top.
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

          <p v-else class="text-sm text-muted">No ranges - cards only show what the teacher writes. Use "Restore defaults" to bring the standard set back.</p>

          <UButton class="mt-4" size="sm" variant="outline" icon="i-lucide-plus" @click="addRemarkBand">
            Add range
          </UButton>
        </UCard>

        <UCard data-guide="rcd-style">
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
      <!-- The preview stays in view while the settings on the left scroll, sized to one A4 page. -->
      <div class="space-y-6 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)]">

        <UCard data-guide="rcd-preview" :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Live Preview
              </h3>
              <UBadge v-if="documentService.status.value?.reportCards" size="sm" variant="subtle" color="neutral"
                label="As it prints" />
            </div>
          </template>

          <!-- With the document service: the school's design, filled with its latest report card (or placeholders). -->
          <div v-if="documentService.status.value?.reportCards" class="p-3">
            <DocumentPdfFrame height="a4" :reload-key="`${previewVersion}-${designTab}`"
              :caption="designTab === 'ALL' ? 'Your design, with your latest report card' : `${levelLabel(designTab)} design`"
              :fetcher="() => ReportCardApi().designPreview(null, designTab === 'ALL' ? null : designTab)" />
            <p class="mt-2 text-xs text-muted">
              It updates when you save your settings or pick another design.
            </p>
          </div>

          <div v-else-if="documentService.status.value" class="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <UIcon name="i-lucide-printer" class="size-10 text-muted" />
            <p class="font-semibold text-highlighted">Report card printing isn't set up yet</p>
            <p class="text-sm text-muted">
              Report cards are printed by the document service. Once the platform team connects it, your design
              shows here exactly as it prints.
            </p>
          </div>
          <div v-else class="p-3">
            <USkeleton class="aspect-[210/297] max-h-[calc(100vh-11rem)] w-full rounded-lg" />
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
const documentService = useDocumentService()
onMounted(() => documentService.ensureLoaded())
// Bumped when the design or the settings change, so the preview is made again.
const previewVersion = ref(0)
// Which design is being chosen and previewed: all levels, or one level's own.
const { levelOptions, load: loadStructure } = useSchoolStructure()
onMounted(() => loadStructure())
const designTab = ref<string>('ALL')
const levelTabs = computed(() => [
  { label: 'All levels', value: 'ALL' },
  ...levelOptions.value.map(l => ({ label: l.label, value: l.value }))
])
const { settings } = storeToRefs(store)

const saving = ref(false)
const fetching = ref(true)



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
    previewVersion.value++
    router.push('/report-cards')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save report card settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Report Card Design')
  await store.fetch().finally(() => { fetching.value = false })
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
