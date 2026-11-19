<template>
  <div class="px-4 md:px-6 space-y-3">
    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else-if="!structure || !assessment">
      <div class="space-y-3 py-6 text-center">
        <p class="text-sm font-medium text-highlighted">This assessment isn't scored as continuous assessment</p>
        <p class="text-xs text-muted">Pick a subject that is set up for CA + formal test from the grade entry page.</p>
        <UButton to="/grades" label="Go to grade entry" />
      </div>
    </UCard>

    <template v-else>
      <!-- One slim progress card instead of paragraphs of explanation (those are in "How it works"). -->
      <UCard data-guide="ca-progress" :ui="{ body: 'p-3 sm:p-4' }">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge :color="caSubmitted ? 'success' : 'primary'" variant="subtle" size="lg"
              :icon="caSubmitted ? 'lucide:check-circle' : 'lucide:circle-dot'">
              {{ monitorOnly ? 'CA (monitoring)' : '1 · CA recordings' }}
            </UBadge>
            <UIcon name="lucide:chevron-right" class="size-4 text-muted" />
            <UBadge :color="allFormalIn ? 'success' : formalEditable ? 'primary' : 'neutral'" variant="subtle" size="lg"
              :icon="allFormalIn ? 'lucide:check-circle' : formalEditable ? 'lucide:circle-dot' : 'lucide:lock'">
              {{ monitorOnly ? `${caFormalName(structure)} (the score)` : `2 · ${caFormalName(structure)}` }}
            </UBadge>
          </div>
          <div class="flex flex-col gap-1 sm:items-end">
            <p class="text-xs text-muted sm:text-right">{{ progressText }}</p>
          </div>
        </div>
        <div class="flex justify-between mt-3 flex-wrap gap-2 border-t border-default pt-3">
          <div class="flex flex-wrap gap-2">
          <UButton size="sm" icon="lucide:circle-help" label="How it works" color="neutral" variant="ghost"
            @click="() => { helpOpen = true }" />
          <UButton data-guide="ca-insight" size="sm" icon="lucide:chart-no-axes-combined" label="Class insight"
            color="neutral" variant="subtle" @click="() => { insightOpen = true }" />
          <UButton data-guide="ca-weeks" size="sm" icon="lucide:calendar-check" color="neutral" variant="subtle"
            :label="`${caPartsNoun(structure).plural} (${lockedCount}/${structure.caEntries} locked)`"
            @click="() => { weeksOpen = true }" />
        </div>
        <div class="flex items-center">
          <GuideButton guide="teacher-continuous" />
          <HelpButton topic="teacher-continuous" /></div>
        </div>
      </UCard>

      <!-- The steps, as in the mobile app: one chip per CA recording, then the formal test. It opens on what's
           next, and the chip being worked on is kept in view. -->
      <div data-guide="ca-students" class="flex items-center gap-2">
        <div ref="stepperEl" class="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" role="tablist"
          aria-label="Recordings and the formal test">
          <button v-for="p in partOrder" :key="p" type="button" role="tab" :data-ca-step="p"
            :aria-selected="activePart === p" :disabled="!partOpen(p)"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="activePart === p
              ? 'border-primary bg-primary text-inverted'
              : 'border-default bg-default text-highlighted hover:bg-elevated/60'"
            @click="pickPart(p)">
            <UIcon v-if="p !== 0 && (isLocked(p) || caSubmitted)" name="lucide:lock" class="size-3.5" />
            <UIcon v-else-if="p !== 0 && caPartIsAuto(structure, p)" name="lucide:calendar-check" class="size-3.5" />
            <UIcon v-else-if="p === 0 && !partEditableFor(0)" name="lucide:lock-keyhole" class="size-3.5" />
            <span class="whitespace-nowrap">{{ partLabel(p) }} · {{ partFilled(p) }}/{{ rows.length }}</span>
          </button>
        </div>
        <div class="hidden shrink-0 gap-0.5 rounded-lg bg-elevated/60 p-0.5 md:flex" role="group" aria-label="View">
          <UButton size="xs" :variant="view === 'step' ? 'solid' : 'ghost'" color="neutral" icon="lucide:list-ordered"
            label="Step by step" @click="() => { view = 'step' }" />
          <UButton size="xs" :variant="view === 'all' ? 'solid' : 'ghost'" color="neutral" icon="lucide:table"
            label="All marks" @click="() => { view = 'all' }" />
        </div>
      </div>

      <!-- Step by step (always on a phone): notes, then one box per student for the step on screen. -->
      <div class="space-y-3" :class="view === 'all' ? 'md:hidden' : ''">
        <div class="space-y-2">
          <div v-for="(n, i) in notes" :key="i" class="flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm"
            :class="NOTE_STYLE[n.tone].box">
            <UIcon :name="n.icon" class="mt-0.5 size-4 shrink-0" :class="NOTE_STYLE[n.tone].icon" />
            <p class="text-default">{{ n.text }}</p>
          </div>
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-2.5">
            <p class="text-sm font-semibold text-highlighted">{{ partLabel(activePart) }}</p>
            <p class="text-xs text-muted">
              {{ partFilled(activePart) }} of {{ rows.length }} have a mark<span v-if="partEditable"> · Enter goes to
                the next student</span>
            </p>
          </div>
          <div class="divide-y divide-default">
            <div v-for="(row, i) in rows" :key="row.id" class="flex items-center gap-3 px-4 py-2.5"
              :class="partEditable && isEmpty(row.id, activePart) ? 'bg-warning/5' : ''">
              <UAvatar :src="row.photo" :alt="row.name" size="sm"
                class="hidden shrink-0 bg-white ring-1 ring-default sm:inline-flex" />
              <button type="button" class="min-w-0 flex-1 text-left" @click="() => { detailId = row.id }">
                <p class="truncate font-semibold text-highlighted">{{ row.name }}</p>
                <p class="truncate text-xs text-muted">{{ rowSummary(row) }}</p>
              </button>
              <template v-if="partEditable">
                <UInput v-if="activePart !== 0" :data-ca-input="i" v-model.number="typed[row.id]![activePart - 1]"
                  type="number" inputmode="decimal" min="0" :max="outOf(activePart)" :step="byWeight ? 'any' : 1"
                  placeholder="-" class="w-28 shrink-0" :ui="{ base: 'text-base text-center pe-12' }"
                  @update:model-value="setEntry(row.id, activePart)" @keydown.enter.prevent="nextInput(i)">
                  <template #trailing><span class="text-xs text-muted">/{{ fmt(outOf(activePart)) }}</span></template>
                </UInput>
                <UInput v-else :data-ca-input="i" v-model.number="form[row.id]!.formal" type="number"
                  inputmode="decimal" min="0" max="100" placeholder="-" class="w-28 shrink-0"
                  :ui="{ base: 'text-base text-center pe-12' }" @update:model-value="clampFormal(row.id)"
                  @keydown.enter.prevent="nextInput(i)">
                  <template #trailing><span class="text-xs text-muted">/100</span></template>
                </UInput>
              </template>
              <span v-else class="w-28 shrink-0 rounded-lg bg-elevated/60 px-3 py-1.5 text-center text-base">
                {{ activePart === 0 ? (form[row.id]?.formal ?? '-') : shownEntry(row.id, activePart) }}
              </span>
            </div>
          </div>
          <div v-if="prevPart !== undefined || nextPart !== undefined"
            class="flex items-center justify-between gap-2 border-t border-default px-2 py-1.5">
            <UButton v-if="prevPart !== undefined" size="sm" icon="lucide:arrow-left" color="neutral" variant="ghost"
              :label="partLabel(prevPart)" @click="pickPart(prevPart)" />
            <span v-else />
            <UButton v-if="nextPart !== undefined" size="sm" trailing-icon="lucide:arrow-right" color="neutral"
              variant="ghost" :label="partLabel(nextPart)" @click="pickPart(nextPart)" />
          </div>
        </UCard>
      </div>

      <!-- Desktop, "All marks": every recording side by side - for looking across, or quick corrections. -->
      <UCard v-if="view === 'all'" class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                <th class="sticky left-0 bg-default px-4 py-3">Student</th>
                <th v-for="n in structure.caEntries" :key="n" class="px-2 py-3">
                  <span class="flex items-center gap-1 whitespace-nowrap">
                    <UIcon v-if="isLocked(n)" name="lucide:lock" class="text-success" />
                    {{ caPartLabel(structure, n) }}
                    <span v-if="byWeight" class="text-[10px] normal-case text-muted">/{{ fmt(outOf(n)) }}</span>
                    <span v-else-if="structure.caComponents?.length" class="text-[10px] normal-case text-muted">{{ structure.caComponents[n - 1]?.weight }}%</span>
                    <UBadge v-if="caPartIsAuto(structure, n)" size="sm" variant="subtle" color="info">register</UBadge>
                  </span>
                </th>
                <th class="px-3 py-3">CA avg</th>
                <th class="px-3 py-3">{{ caFormalName(structure) }}</th>
                <th class="px-3 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="border-b border-default last:border-0">
                <td class="sticky left-0 bg-default px-4 py-2">
                  <button type="button" class="flex items-center gap-2.5 text-left" @click="() => { detailId = row.id }">
                    <UAvatar :src="row.photo" :alt="row.name" size="md" class="shrink-0 bg-white ring-1 ring-default" />
                    <span class="font-medium text-highlighted whitespace-nowrap">{{ row.name }}</span>
                    <UIcon v-if="trendOf(row).trend === 'improving'" name="lucide:trending-up" class="size-4 text-success" />
                    <UIcon v-else-if="trendOf(row).trend === 'declining'" name="lucide:trending-down" class="size-4 text-error" />
                  </button>
                </td>
                <td v-for="n in structure.caEntries" :key="n" class="px-1 py-2 whitespace-nowrap">
                  <UInput v-if="caEditable && !isLocked(n) && !caPartIsAuto(structure, n)"
                    v-model.number="typed[row.id]![n - 1]" type="number" min="0" :max="outOf(n)" :step="byWeight ? 'any' : 1"
                    class="w-20 align-middle" :ui="{ base: 'text-base' }" @update:model-value="setEntry(row.id, n)" />
                  <span v-else class="px-2">{{ shownEntry(row.id, n) }}</span>
                  <!-- The mark out of 100, then what it is worth: 100 on a 10% part = 100 (10/10). When marks are
                       already typed out of the part's weight, the mark is the points, so this is left out. -->
                  <span v-if="structure.caComponents?.length && !byWeight" class="text-xs text-muted">({{ ptsOf(form[row.id]?.entries[n - 1], structure.caComponents[n - 1]?.weight) }}/{{ structure.caComponents[n - 1]?.weight }})</span>
                </td>
                <td class="px-3 py-2">
                  <span class="font-medium">{{ preview(row).ca ?? '-' }}</span>
                  <UBadge v-if="strengthOf(preview(row).ca)" :color="strengthOf(preview(row).ca)!.color" variant="soft"
                    size="sm" class="ml-1.5">{{ strengthOf(preview(row).ca)!.label }}</UBadge>
                  <span v-if="!monitorOnly" class="ml-1 text-xs text-muted">({{ fmt(preview(row).caPts) }}/{{ structure.caPercentage }})</span>
                </td>
                <td class="px-3 py-2 whitespace-nowrap">
                  <UInput v-if="formalEditable" v-model.number="form[row.id]!.formal" type="number" min="0" max="100"
                    class="w-24 align-middle" :ui="{ base: 'text-base' }" @update:model-value="clampFormal(row.id)" />
                  <span v-else-if="!caSubmitted && !monitorOnly" class="inline-flex items-center gap-1 text-xs text-muted">
                    <UIcon name="lucide:lock" /> after CA
                  </span>
                  <span v-else>{{ form[row.id]?.formal ?? '-' }}</span>
                  <span v-if="!monitorOnly && (caSubmitted || formalEditable)" class="ml-1 text-xs text-muted">({{ fmt(preview(row).formalPts) }}/{{ structure.formalPercentage }})</span>
                </td>
                <td class="px-3 py-2">
                  <UBadge color="primary" variant="soft" size="lg">{{ preview(row).total }}</UBadge>
                  <span class="ml-1 text-xs text-muted">(/100)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- The app's bottom bar: Save, and the one thing that comes next - inside the page, under the list. -->
      <UCard v-if="editable" data-guide="ca-actions" class="mb-2" :ui="{ body: 'p-3 sm:p-3' }">
        <div class="flex flex-col gap-2 sm:flex-row">
          <UButton class="w-full justify-center sm:flex-1" size="lg" color="neutral" variant="outline" icon="lucide:save"
            label="Save" :loading="saving" :disabled="busy" @click="() => { save(true) }" />
          <UButton v-if="canSubmitForApproval" class="w-full justify-center sm:flex-1" size="lg" color="success"
            icon="lucide:check-circle" label="Submit for approval" :loading="submitting" :disabled="busy"
            @click="submitForApproval" />
          <UButton v-else-if="canSubmitCa" class="w-full justify-center sm:flex-1" size="lg" icon="lucide:send"
            label="Submit CA" :loading="submittingCa" :disabled="busy" @click="submitCa" />
          <UButton v-else-if="canLockPart" class="w-full justify-center sm:flex-1" size="lg" color="success" variant="subtle"
            icon="lucide:lock" :label="`Lock ${partLabel(activePart)}`" :loading="lockingWeek === activePart"
            :disabled="busy" @click="lockWeek(activePart)" />
        </div>
      </UCard>
    </template>

    <!-- How it works: the explanation lives here, not on the page. -->
    <UModal v-model:open="helpOpen" title="How this assessment works">
      <template #body>
        <div v-if="structure" class="space-y-4 text-sm">
          <template v-if="monitorOnly">
            <div>
              <p class="font-medium text-highlighted">The formal test is the score</p>
              <p class="mt-0.5 text-muted">Each student's score for {{ assessment?.name }} is their formal test mark (0-100).</p>
            </div>
            <div>
              <p class="font-medium text-highlighted">CA is for monitoring</p>
              <p class="mt-0.5 text-muted">
                Record {{ structure.caEntries }} {{ caPartsNoun(structure).plural.toLowerCase() }} of classwork to see how
                strong each student is (Strong, Steady or Needs support). It never changes the score, and nothing waits
                on it - you can enter the test and submit for approval at any time.
              </p>
            </div>
          </template>
          <template v-else>
            <div>
              <p class="font-medium text-highlighted">Step 1 · CA recordings ({{ structure.caPercentage }}%)</p>
              <p class="mt-0.5 text-muted">
                Record {{ structure.caEntries }} {{ caPartsNoun(structure).plural.toLowerCase() }} for every student,
                <template v-if="byWeight">each marked out of what it is worth (on a {{ fmt(outOf(1)) }}% {{ caPartsNoun(structure).singular.toLowerCase() }}, enter 0 to {{ fmt(outOf(1)) }})</template>
                <template v-else>each marked out of 100</template>.
                Lock each one once everyone has a mark, then submit the CA - that closes the rest.
              </p>
            </div>
            <div>
              <p class="font-medium text-highlighted">Step 2 · {{ caFormalName(structure) }} ({{ structure.formalPercentage }}%)</p>
              <p class="mt-0.5 text-muted">Opens once the CA is submitted. Enter one mark out of 100 for every student.</p>
            </div>
            <div>
              <p class="font-medium text-highlighted">The score</p>
              <p class="mt-0.5 text-muted">
                The CA average and the test mark are combined by their shares - for example CA 80 and test 80 gives
                {{ structure.caPercentage }}% of 80 + {{ structure.formalPercentage }}% of 80 = 80.
              </p>
            </div>
          </template>
          <div>
            <p class="font-medium text-highlighted">Empty boxes</p>
            <p class="mt-0.5 text-muted">An empty box means "not recorded yet", never zero.</p>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Weeks: lock / unlock each recording. -->
    <UModal v-model:open="weeksOpen" :title="structure ? `${caPartsNoun(structure).plural}` : 'Recordings'"
      description="Lock a recording once every student has a mark for it, so it can't be changed later.">
      <template #body>
        <div v-if="structure" class="divide-y divide-default">
          <div v-for="n in structure.caEntries" :key="n" class="flex items-center justify-between gap-3 py-2.5">
            <div class="flex min-w-0 items-center gap-2">
              <UIcon :name="isLocked(n) ? 'lucide:lock' : 'lucide:pencil-line'"
                :class="isLocked(n) ? 'text-success' : 'text-muted'" />
              <p class="text-sm font-medium">{{ caPartLabel(structure, n) }}</p>
              <span class="text-xs text-muted">{{ weekFilled(n) }}/{{ rows.length }} marked</span>
            </div>
            <UButton v-if="editable && !isLocked(n) && weekComplete(n)" size="sm" variant="subtle" color="success"
              icon="lucide:lock" label="Lock" :loading="lockingWeek === n" :disabled="busy" @click="lockWeek(n)" />
            <UButton v-else-if="editable && isLocked(n) && isAdmin" size="sm" variant="ghost" color="warning"
              icon="lucide:lock-open" label="Unlock" :disabled="busy" @click="weeksOpen = false; askUnlock(n)" />
            <span v-else-if="isLocked(n)" class="text-xs text-success">Locked</span>
            <span v-else class="text-xs text-muted">Waiting for marks</span>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Class insight. -->
    <UModal v-model:open="insightOpen" title="Class insight">
      <template #body>
        <GradesTeacherCaInsight v-if="assessment" :assessment="assessment" :rows="rows" />
      </template>
    </UModal>

    <!-- One student's detail. -->
    <UModal v-model:open="detailOpen" :title="detailRow?.name || 'Student'">
      <template #body>
        <div v-if="detailRow && structure" class="space-y-4 text-sm">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-xl bg-elevated/40 p-3">
              <p class="text-xs text-muted">CA average</p>
              <p class="text-lg font-bold text-highlighted">{{ preview(detailRow).ca ?? '-' }}<span v-if="preview(detailRow).ca !== null" class="text-sm">%</span></p>
              <UBadge v-if="strengthOf(preview(detailRow).ca)" :color="strengthOf(preview(detailRow).ca)!.color" variant="soft"
                size="sm">{{ strengthOf(preview(detailRow).ca)!.label }}</UBadge>
            </div>
            <div class="rounded-xl bg-elevated/40 p-3">
              <p class="text-xs text-muted">{{ caFormalName(structure) }}</p>
              <p class="text-lg font-bold text-highlighted">{{ form[detailRow.id]?.formal ?? '-' }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3">
              <p class="text-xs text-muted">Score</p>
              <p class="text-lg font-bold text-primary">{{ preview(detailRow).total }}</p>
            </div>
          </div>

          <div>
            <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Recordings</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="n in structure.caEntries" :key="n" class="rounded-lg border border-default px-2.5 py-1 text-xs">
                <span class="text-muted">{{ caPartLabel(structure, n) }}:</span>
                <span class="ml-1 font-medium text-highlighted">{{ shownEntry(detailRow.id, n) }}</span>
                <span v-if="byWeight" class="text-muted">/{{ fmt(outOf(n)) }}</span>
              </span>
            </div>
          </div>

          <p v-if="trendOf(detailRow).trend !== 'not-enough-data'" class="flex items-center gap-2 text-muted">
            <UIcon :name="trendOf(detailRow).trend === 'improving' ? 'lucide:trending-up' : trendOf(detailRow).trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'"
              :class="trendOf(detailRow).trend === 'improving' ? 'text-success' : trendOf(detailRow).trend === 'declining' ? 'text-error' : ''" />
            CA is {{ CA_TREND_LABEL[trendOf(detailRow).trend].toLowerCase() }}.
          </p>

          <p class="rounded-lg bg-elevated/40 px-3 py-2 text-xs text-muted">
            <template v-if="monitorOnly">The score is the formal test only - CA is for monitoring and doesn't change it.</template>
            <template v-else>
              CA {{ preview(detailRow).caPts }}/{{ structure.caPercentage }} + Test
              {{ preview(detailRow).formalPts }}/{{ structure.formalPercentage }} =
              <span class="font-semibold text-highlighted">{{ preview(detailRow).total }}/100</span>
            </template>
          </p>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="unlockOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Unlock {{ structure ? caPartLabel(structure, unlockWeek) : '' }}</h3>
          </template>
          <div class="space-y-3">
            <UAlert color="warning" variant="soft" icon="lucide:shield-alert" title="This is recorded on the audit trail"
              description="A locked recording is closed so the record can't be quietly changed. Unlocking it lets it be corrected, and if the CA was already submitted it opens again and has to be re-submitted." />
            <UFormField label="Why is it being unlocked?" required>
              <UTextarea v-model="unlockReason" class="w-full" :rows="2" autoresize
                placeholder="e.g. Week 3 marks were entered against the wrong class" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton class="w-full flex items-center justify-center" label="Cancel" variant="soft"
                :disabled="unlocking" @click="() => { unlockOpen = false }" />
              <UButton class="w-full flex items-center justify-center" label="Unlock" color="warning" :loading="unlocking"
                :disabled="!unlockReason.trim()" @click="unlockWeekConfirm" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useAssessmentStore()
const { success, error: toastError } = useNotify()
const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const teacherSubjectId = computed(() => String(route.query.teacherSubjectId || ''))
const termId = computed(() => String(route.query.termId || ''))
const assessmentId = computed(() => String(route.query.assessmentId || ''))

const loading = ref(true)
const saving = ref(false)
const submittingCa = ref(false)
const submitting = ref(false)
const busy = computed(() => saving.value || submittingCa.value || submitting.value)

// The explanations, week locking, insight and one student's breakdown live in modals rather than on the page.
const helpOpen = ref(false)
const weeksOpen = ref(false)
const insightOpen = ref(false)
const detailId = ref('')

const detailOpen = computed({
  get: () => !!detailId.value,
  set: (v: boolean) => { if (!v) detailId.value = '' }
})

const rows = ref<StudentAssessment[]>([])
const assessment = ref<Assessment | null>(null)

type RowForm = { entries: (number | null)[], formal: number | null }
const form = reactive<Record<string, RowForm>>({})
// What the teacher has typed in each CA box, in their school's scale (out of 100, or out of the recording's weight).
// form keeps the 0-100 mark the server stores; this only exists so "1.5" out of 3 isn't rewritten mid-typing.
const typed = reactive<Record<string, (number | undefined)[]>>({})

const structure = computed(() => continuousOf(rows.value, assessmentId.value))
const caSubmitted = computed(() => !!structure.value?.caSubmitted)
// CA is only for monitoring (worth 0% of the score): it never gates the formal test or the approval.
const monitorOnly = computed(() => !!structure.value && structure.value.caPercentage === 0)
const editable = computed(() => !!assessment.value && isEditableStatus(assessment.value.status as ScoreStatus))
const weekFilled = (week: number) => rows.value.filter(r => form[r.id]?.entries[week - 1] != null).length
const detailRow = computed(() => rows.value.find(r => r.id === detailId.value) ?? null)
const lockedCount = computed(() => structure.value?.lockedWeeks?.length ?? 0)
const isLocked = (week: number) => !!structure.value?.lockedWeeks?.includes(week)
// Every student has a mark for the week - it can be locked.
const weekComplete = (week: number) => rows.value.length > 0
  && rows.value.every(r => form[r.id]?.entries[week - 1] !== null && form[r.id]?.entries[week - 1] !== undefined)
const caEditable = computed(() => editable.value && !caSubmitted.value)
const formalEditable = computed(() => editable.value && (caSubmitted.value || monitorOnly.value))
const step = computed(() => caSubmitted.value ? 2 : 1)

// ---- Step by step, as in the mobile app: one CA recording (or the formal test) at a time for the whole class.
// Part 0 is the formal test; 1..caEntries are the recordings.
const view = ref<'step' | 'all'>('step')
const activePart = ref(1)
// The teacher chose a step themselves - a save keeps them there. Locking a recording or submitting the CA moves on.
const userPicked = ref(false)
const stepperEl = ref<HTMLElement | null>(null)
const partOrder = computed(() => structure.value
  ? [...Array.from({ length: structure.value.caEntries }, (_, i) => i + 1), 0]
  : [])
const partIndex = computed(() => Math.max(0, partOrder.value.indexOf(activePart.value)))
const formalFilled = computed(() => rows.value.filter(r => form[r.id]?.formal != null).length)
function partLabel(p: number) {
  return p === 0 ? caFormalName(structure.value) : caPartLabel(structure.value!, p)
}
function partFilled(p: number) {
  return p === 0 ? formalFilled.value : weekFilled(p)
}
function isEmpty(rowId: string, p: number) {
  return p === 0 ? form[rowId]?.formal == null : form[rowId]?.entries[p - 1] == null
}
// The formal test can only be opened once it's open for entry (or there's something to see).
function partOpen(p: number) {
  return p !== 0 || formalEditable.value || caSubmitted.value || formalFilled.value > 0
}
function partEditableFor(p: number) {
  const s = structure.value
  if (!s) return false
  return p === 0 ? formalEditable.value : caEditable.value && !isLocked(p) && !caPartIsAuto(s, p)
}
const partEditable = computed(() => partEditableFor(activePart.value))
// One line under each student, as in the app: "CA 80% · End of term test 50 · total 62".
function rowSummary(row: StudentAssessment) {
  const p = preview(row), s = structure.value
  const ca = `CA ${p.ca === null ? '-' : `${p.ca}%`}`
  if (!s || monitorOnly.value) return ca
  const formal = form[row.id]?.formal
  return `${ca} · ${caFormalName(s)} ${formal ?? '-'} · total ${p.total}`
}
const canSubmitCa = computed(() =>
  caEditable.value && !monitorOnly.value && rows.value.length > 0 && missingCa.value === 0)
const canSubmitForApproval = computed(() =>
  editable.value && (caSubmitted.value || monitorOnly.value) && allFormalIn.value)
type NoteTone = 'info' | 'primary' | 'muted' | 'warning'
const NOTE_STYLE: Record<NoteTone, { box: string, icon: string }> = {
  info: { box: 'bg-info/10', icon: 'text-info' },
  primary: { box: 'bg-primary/10', icon: 'text-primary' },
  muted: { box: 'bg-elevated/60', icon: 'text-muted' },
  warning: { box: 'bg-warning/10', icon: 'text-warning' }
}
// The notes above the list, as in the app: how it's scored, what's closed, and what to do next.
const notes = computed(() => {
  const s = structure.value, p = activePart.value
  if (!s) return []
  const out: { icon: string, tone: NoteTone, text: string }[] = [{
    icon: 'lucide:calculator',
    tone: 'info',
    text: monitorOnly.value
      ? `CA is for monitoring only - the ${caFormalName(s).toLowerCase()} is the score.`
      : `CA ${s.caPercentage}% + ${caFormalName(s)} ${s.formalPercentage}%${byWeight.value ? ' · marks are out of each part\'s weight' : ''}.`
  }]
  if (!editable.value) {
    out.push({ icon: 'lucide:lock', tone: 'muted', text: 'This assessment has been submitted and can\'t be changed here.' })
  } else if (p === 0 && !formalEditable.value) {
    out.push({ icon: 'lucide:lock-keyhole', tone: 'muted', text: `The ${caFormalName(s).toLowerCase()} opens once the CA is submitted.` })
  } else if (p !== 0 && caPartIsAuto(s, p)) {
    out.push({ icon: 'lucide:calendar-check', tone: 'info', text: `${caPartLabel(s, p)} is filled in from the attendance register.` })
  } else if (p !== 0 && (isLocked(p) || caSubmitted.value)) {
    out.push({
      icon: 'lucide:lock',
      tone: 'muted',
      text: caSubmitted.value
        ? 'The CA has been submitted - its recordings are closed.'
        : `${caPartLabel(s, p)} is locked. ${isAdmin.value ? 'Unlock it from the recordings list if it needs correcting.' : 'Ask an administrator if it needs correcting.'}`
    })
  }
  if (editable.value) out.push({ icon: 'lucide:flag', tone: 'primary', text: hint.value })
  return out
})
// Opens on what's next: the first recording still being filled in, else the formal test once it's open.
function startPart(): number {
  const s = structure.value
  if (!s) return 1
  if (caSubmitted.value) return 0
  for (let n = 1; n <= s.caEntries; n++) {
    if (!isLocked(n) && !caPartIsAuto(s, n) && weekFilled(n) < rows.value.length) return n
  }
  if (monitorOnly.value && !allFormalIn.value) return 0
  return s.caEntries ? 1 : 0
}
const prevPart = computed(() => partOrder.value[partIndex.value - 1])
const nextPart = computed(() => {
  const p = partOrder.value[partIndex.value + 1]
  return p === undefined || !partOpen(p) ? undefined : p
})
const canLockPart = computed(() => {
  const p = activePart.value, s = structure.value
  return !!s && p !== 0 && editable.value && !caSubmitted.value && !isLocked(p) && !caPartIsAuto(s, p) && weekComplete(p)
})
function focusInput(i: number) {
  const el = document.querySelector<HTMLInputElement>(`[data-ca-input="${i}"] input, input[data-ca-input="${i}"]`)
  el?.focus()
  el?.select()
}
function nextInput(i: number) {
  if (i + 1 < rows.value.length) focusInput(i + 1)
}
// Selects a step and keeps it in view in the stepper; the first box takes the cursor.
function goPart(p: number) {
  activePart.value = p
  nextTick(() => {
    stepperEl.value?.querySelector(`[data-ca-step="${p}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    if (partEditable.value) focusInput(0)
  })
}
function pickPart(p: number) {
  userPicked.value = true
  goPart(p)
}
// After a load: stay on the teacher's own choice while it's still open, else go to what's next.
function settlePart() {
  if (!structure.value) return
  if (!userPicked.value || !partOrder.value.includes(activePart.value) || !partOpen(activePart.value)) {
    goPart(startPart())
  }
}

const subtitle = computed(() => structure.value
  ? (monitorOnly.value
    ? `CA for monitoring only · formal test is the score · ${rows.value.length} students`
    : `CA ${structure.value.caPercentage}% + formal test ${structure.value.formalPercentage}% · ${rows.value.length} students`)
  : '')

// How strong a student's CA is - for monitoring: 70+ strong, 50-69 steady, below 50 needs support.
function strengthOf(ca: number | null) {
  if (ca === null) return null
  if (ca >= 70) return { label: 'Strong', color: 'success' as const }
  if (ca >= 50) return { label: 'Steady', color: 'warning' as const }
  return { label: 'Needs support', color: 'error' as const }
}

function scoreOf(row: StudentAssessment) {
  return row.scores.find(s => s.assessment === assessmentId.value)
}

function resetForm() {
  for (const k of Object.keys(form)) delete form[k]
  for (const k of Object.keys(typed)) delete typed[k]
  const s = structure.value
  if (!s) return
  for (const row of rows.value) {
    const c = scoreOf(row)?.continuous
    form[row.id] = {
      entries: Array.from({ length: s.caEntries }, (_, i) => c?.caEntryScores?.[i] ?? null),
      formal: c?.formalScore ?? null
    }
    typed[row.id] = form[row.id]!.entries.map((v, i) => caEntryFromStored(v, outOf(i + 1)) ?? undefined)
  }
}

// Brings the attendance part up to date from the register (a no-op when the setup has no such part), so the
// sheet always opens with current marks. Returns whether anything changed.
async function syncAttendance() {
  const s = structure.value
  if (!s || !editable.value || s.caSubmitted || !s.caComponents?.some(c => c.source === 'ATTENDANCE')) return false
  return (await AssessmentApi().syncAttendanceCa(teacherSubjectId.value, {
    assessmentId: assessmentId.value, termId: termId.value
  })) > 0
}

async function load(sync = true) {
  loading.value = true
  try {
    const [students, cycles] = await Promise.all([
      store.fetchAllStudentAssessments(teacherSubjectId.value, termId.value),
      store.fetchAllAssessments(teacherSubjectId.value, termId.value)
    ])
    rows.value = students || []
    assessment.value = (cycles || []).find((a: Assessment) => a.id === assessmentId.value) || null
    resetForm()
    if (sync && await syncAttendance()) return load(false)
    settlePart()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to load the assessment')
  } finally {
    loading.value = false
  }
}

// The school marks CA out of each recording's weight (2 on a 3% week) instead of out of 100.
const byWeight = computed(() => structure.value?.caScoreScale === 'WEIGHT')
function outOf(n: number) {
  return caEntryOutOf(structure.value, n)
}
// A recorded mark as the teacher reads it: 67 -> "2" on a 3% week when marking by weight.
function shownEntry(rowId: string, n: number) {
  return fmt(caEntryFromStored(form[rowId]?.entries[n - 1], outOf(n)))
}
// Stores what was typed as a 0-100 mark. Out of range is pulled back to the limit; out of 100 it is also rounded,
// as before.
function setEntry(rowId: string, n: number) {
  const f = form[rowId], t = typed[rowId]
  if (!f || !t) return
  const max = outOf(n), v = t[n - 1]
  f.entries[n - 1] = caEntryToStored(v, max)
  if (v === null || v === undefined || (v as unknown) === '') t[n - 1] = undefined
  else if (max === 100) t[n - 1] = f.entries[n - 1] ?? undefined
  else if (Number(v) > max) t[n - 1] = max
  else if (Number(v) < 0) t[n - 1] = 0
}

function clampTo(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : null
}
function clampFormal(rowId: string) {
  const f = form[rowId]
  if (f) f.formal = clampTo(f.formal)
}

// 77 -> "77", 28.8 -> "28.8", missing -> "-"
function fmt(n: number | null | undefined) {
  return n === null || n === undefined || Number.isNaN(n) ? '-' : String(Math.round(n * 10) / 10)
}
// What a mark out of 100 is worth in a part of that weight: 100 on a 10% part is 10.
function ptsOf(mark: number | null | undefined, weight: number | undefined) {
  return mark === null || mark === undefined || !weight ? '-' : fmt(mark * weight / 100)
}

function preview(row: StudentAssessment) {
  const s = structure.value, f = form[row.id]
  if (!s || !f) return { ca: null as number | null, caPts: 0, formalPts: 0, total: 0 }
  const ca = caComponentOf(f.entries, caWeights(s))
  return {
    ca,
    caPts: caPoints(ca, s.caPercentage),
    formalPts: caPoints(f.formal, s.formalPercentage),
    total: caCombine(ca, f.formal, s.caPercentage, s.formalPercentage)
  }
}

// One short line of where things stand (the long explanations are in "How it works").
const progressText = computed(() => {
  const n = rows.value.length
  const formalIn = rows.value.filter(r => form[r.id]?.formal !== null && form[r.id]?.formal !== undefined).length
  if (monitorOnly.value) return `Formal test: ${formalIn} of ${n} in`
  if (!caSubmitted.value) return missingCa.value > 0 ? `${missingCa.value} CA mark${missingCa.value === 1 ? '' : 's'} still empty` : 'All CA marks are in'
  return `Formal test: ${formalIn} of ${n} in`
})

function trendOf(row: StudentAssessment) {
  return caTrendOf(form[row.id]?.entries ?? [])
}

// How many CA boxes are still empty across the class - the CA can only be submitted at zero.
const missingCa = computed(() =>
  Object.values(form).reduce((sum, f) => sum + f.entries.filter(v => v === null).length, 0))
const allFormalIn = computed(() =>
  rows.value.length > 0 && rows.value.every(r => form[r.id]?.formal !== null && form[r.id]?.formal !== undefined))

const hint = computed(() => {
  if (monitorOnly.value)
    return allFormalIn.value
      ? 'The formal test is in for everyone. Submit for approval - CA is only for monitoring and doesn\'t need finishing first.'
      : 'Enter the formal test for every student, then submit for approval. CA can be recorded any time and never changes the score.'
  if (!caSubmitted.value)
    return missingCa.value > 0
      ? `${missingCa.value} CA recording${missingCa.value === 1 ? '' : 's'} still empty. Every ${structure.value ? caPartsNoun(structure.value).singular.toLowerCase() : 'recording'} needs a mark for every student before the CA can be submitted.`
      : 'All CA recordings are in. Submit the CA to open the formal test.'
  return allFormalIn.value
    ? 'Everything is in. Submit for approval.'
    : 'Enter the formal test for every student, then submit for approval.'
})

function buildRecords() {
  return rows.value.flatMap(row => {
    const score = scoreOf(row), f = form[row.id]
    if (!score || !f) return []
    return [{
      scoreId: score.id,
      // Only what has been recorded - an empty box means "not yet", never "zero".
      // Locked weeks are closed - never sent back.
      entries: caSubmitted.value ? [] : f.entries.flatMap((v, i) => v === null || isLocked(i + 1) || caPartIsAuto(structure.value, i + 1) ? [] : [{ entryNumber: i + 1, score: v }]),
      formalScore: (caSubmitted.value || monitorOnly.value) ? f.formal : null
    }]
  })
}

async function save(showToast: boolean) {
  saving.value = true
  try {
    await AssessmentApi().recordContinuous(teacherSubjectId.value, {
      assessmentId: assessmentId.value,
      termId: termId.value,
      records: buildRecords()
    })
    if (showToast) success('Saved')
    await load()
    return true
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to save')
    return false
  } finally {
    saving.value = false
  }
}

const lockingWeek = ref(0)
async function lockWeek(week: number) {
  lockingWeek.value = week
  try {
    // Save first so what is on screen is what gets locked.
    if (!(await save(false))) return
    await AssessmentApi().lockContinuousWeek(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, week
    })
    success(`${structure.value ? caPartLabel(structure.value, week) : 'Recording'} locked`)
    // Done with that one: on to what's next.
    userPicked.value = false
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to lock the recording')
  } finally {
    lockingWeek.value = 0
  }
}

const unlockOpen = ref(false)
const unlockWeek = ref(1)
const unlockReason = ref('')
const unlocking = ref(false)
function askUnlock(week: number) {
  unlockWeek.value = week
  unlockReason.value = ''
  unlockOpen.value = true
}
async function unlockWeekConfirm() {
  unlocking.value = true
  try {
    await AssessmentApi().unlockContinuousWeek(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, week: unlockWeek.value, reason: unlockReason.value.trim()
    })
    success('Unlocked')
    unlockOpen.value = false
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to unlock')
  } finally {
    unlocking.value = false
  }
}

async function submitCa() {
  submittingCa.value = true
  try {
    // Save first so what is on screen is what gets checked.
    saving.value = true
    await AssessmentApi().recordContinuous(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, records: buildRecords()
    })
    saving.value = false
    await AssessmentApi().submitContinuousCa(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value
    })
    success('CA submitted - the formal test is now open')
    // On to the formal test.
    userPicked.value = false
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to submit the CA')
  } finally {
    saving.value = false
    submittingCa.value = false
  }
}

async function submitForApproval() {
  submitting.value = true
  try {
    if (!(await save(false))) return
    await store.submit(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, note: 'Submitted from continuous assessment'
    })
    success('Assessment submitted for approval')
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to submit for approval')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Continuous Assessment')
  useAppStore().setBack('/grades')
  document.title = 'Continuous Assessment | Grades | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
