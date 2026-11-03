<template>
  <div class="space-y-3 px-4 md:px-6">
    <div class="space-y-3 print:hidden">
      <Heading title="Broadsheet" subtitle="Every student against every subject for a term, from the generated report cards." />
      <GradesSectionNav />

      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2 sm:flex-row">
          <USelectMenu v-model="classId" :items="classOptions" value-key="value" label-key="label"
            placeholder="Choose a class" class="w-full sm:w-44" :loading="classStore.loading" />
          <USelectMenu v-if="streamOptions.length" v-model="streamId" :items="streamOptions" value-key="value"
            label-key="label" placeholder="All streams" class="w-full sm:w-40" />
          <USelectMenu v-model="termId" :items="termOptions" value-key="value" label-key="label"
            placeholder="Choose a term" class="w-full sm:w-44" :loading="termStore.loading" />
        </div>
        <UButton v-if="sheet?.rows.length" icon="i-lucide-printer" variant="soft" color="neutral" label="Print"
          @click="printPage" />
      </div>
    </div>

    <UCard v-if="!classId || !termId">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-sheet" class="size-7 text-primary" />
        </div>
        <h3 class="font-semibold text-highlighted">Choose a class and term</h3>
        <p class="max-w-sm text-sm text-muted">The broadsheet shows every student's score in every subject, their
          average and position.</p>
      </div>
    </UCard>

    <UCard v-else-if="loading">
      <div class="space-y-2">
        <USkeleton class="h-8 w-full" />
        <USkeleton v-for="i in 8" :key="i" class="h-6 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="error">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
        </div>
        <h3 class="font-semibold text-highlighted">Couldn't load the broadsheet</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="load" />
      </div>
    </UCard>

    <UCard v-else-if="!sheet?.rows.length">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-warning/10">
          <UIcon name="i-lucide-file-x" class="size-7 text-warning" />
        </div>
        <h3 class="font-semibold text-highlighted">No report cards for this class yet</h3>
        <p class="max-w-sm text-sm text-muted">The broadsheet is built from the term's full report cards. Generate them
          once the grades are approved.</p>
        <UButton to="/report-cards/generate" label="Generate report cards" :icon="GENERATE_ICON" variant="soft" />
      </div>
    </UCard>

    <template v-else>
      <div class="hidden print:block">
        <h1 class="text-xl font-bold">Broadsheet · {{ sheet.className }} · {{ sheet.termName }}</h1>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 print:hidden">
        <Metric :record="{ label: 'Students', value: sheet.studentCount, icon: 'i-lucide-users', color: 'primary', isReady: true }" />
        <Metric :record="{ label: 'Passed', value: `${sheet.passed}/${sheet.studentCount}`, icon: 'i-lucide-circle-check', color: 'success', isReady: true }" />
        <Metric :record="{ label: 'Class average', value: sheet.classAverage, icon: 'i-lucide-chart-line', color: 'info', isReady: true }" />
        <Metric :record="{ label: 'Cards generated', value: sheet.lastGeneratedAt ? formatDate(sheet.lastGeneratedAt) : '—', icon: 'i-lucide-file-text', color: 'neutral', isReady: true }" />
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-elevated/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th class="sticky left-0 z-10 bg-elevated px-3 py-2 text-left">Pos</th>
                <th class="sticky left-10 z-10 min-w-44 bg-elevated px-3 py-2 text-left">Student</th>
                <th v-for="s in sheet.subjects" :key="s" class="px-2 py-2 text-center font-medium">
                  <span class="block max-w-24 truncate" :title="s">{{ s }}</span>
                </th>
                <th class="px-3 py-2 text-center">Avg</th>
                <th class="px-3 py-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="row in sheet.rows" :key="row.studentId" class="hover:bg-muted/30">
                <td class="sticky left-0 bg-default px-3 py-2 font-semibold tabular-nums">{{ row.position }}</td>
                <td class="sticky left-10 bg-default px-3 py-2">
                  <NuxtLink :to="`/report-cards/${row.reportCardId}`" class="font-medium text-highlighted hover:underline">
                    {{ row.studentName }}
                  </NuxtLink>
                  <p class="text-[11px] text-muted">{{ row.admissionNumber }}</p>
                </td>
                <td v-for="s in sheet.subjects" :key="s" class="px-2 py-2 text-center tabular-nums"
                  :class="scoreClass(row.scores[s]?.score)">
                  {{ row.scores[s]?.score ?? '–' }}
                </td>
                <td class="px-3 py-2 text-center font-semibold tabular-nums">{{ row.average }}</td>
                <td class="px-3 py-2 text-center">
                  <UBadge :color="row.passed ? 'success' : 'error'" variant="subtle" size="sm">{{ row.overallGrade }}</UBadge>
                </td>
              </tr>
            </tbody>
            <tfoot class="border-t-2 border-default bg-elevated/40 text-xs">
              <tr>
                <td colspan="2" class="sticky left-0 bg-elevated px-3 py-2 font-semibold">Subject average</td>
                <td v-for="s in sheet.subjectSummaries" :key="s.subject" class="px-2 py-2 text-center font-semibold tabular-nums">{{ s.average }}</td>
                <td colspan="2" />
              </tr>
              <tr>
                <td colspan="2" class="sticky left-0 bg-elevated px-3 py-2 text-muted">Highest / lowest</td>
                <td v-for="s in sheet.subjectSummaries" :key="s.subject" class="px-2 py-2 text-center tabular-nums text-muted">
                  {{ s.highest ?? '–' }}/{{ s.lowest ?? '–' }}
                </td>
                <td colspan="2" />
              </tr>
              <tr>
                <td colspan="2" class="sticky left-0 bg-elevated px-3 py-2 text-muted">Passed</td>
                <td v-for="s in sheet.subjectSummaries" :key="s.subject" class="px-2 py-2 text-center tabular-nums text-muted">
                  {{ s.passed }}/{{ s.sat }}
                </td>
                <td colspan="2" />
              </tr>
            </tfoot>
          </table>
        </div>
        <template #footer>
          <p class="text-xs text-muted print:hidden">
            Scores come from the generated report cards. If grades changed since, regenerate the cards to update this.
          </p>
        </template>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const api = ExamOfficeApi()
const classStore = useClassStore()
const termStore = useTermStore()

const classId = ref<string | undefined>()
const streamId = ref<string | undefined>()
const termId = ref<string | undefined>()
const streamOptions = ref<{ label: string, value: string }[]>([])

const sheet = ref<Broadsheet | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const classOptions = computed(() => classStore.records.map(c => ({ label: c.name, value: c.id })))
const termOptions = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))

function scoreClass(score?: number | null) {
  if (score == null) return 'text-dimmed'
  return score < 50 ? 'text-error' : ''
}

function printPage() {
  window.print()
}

async function load() {
  if (!classId.value || !termId.value) {
    sheet.value = null
    return
  }
  loading.value = true
  error.value = null
  try {
    sheet.value = (await api.broadsheet({ classId: classId.value, termId: termId.value, streamId: streamId.value })) ?? null
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loading.value = false
  }
}

watch(classId, async (id) => {
  streamId.value = undefined
  streamOptions.value = []
  if (id) {
    const streams = await classStore.findAllStreams(id).catch(() => [])
    streamOptions.value = (streams || []).map((s: ClassStream) => ({ label: s.stream.name, value: s.stream.id }))
  }
  load()
})
watch([streamId, termId], load)

onMounted(async () => {
  useAppStore().setTitle('Broadsheet')
  document.title = 'Broadsheet | Skultem'
  classStore.fetchAll(1, 200)
  await termStore.fetchAll(1, 100)
  termId.value = termStore.records.find(t => t.status === 'ACTIVE')?.id
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
