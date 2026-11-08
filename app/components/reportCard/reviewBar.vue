<!-- Where a class's report cards for a term stand in the review step, and - for its class teacher - the approve /
     send back buttons. Admin generates -> class teacher checks, comments, approves (parents then see them) or sends
     them back to the admin with a note -> admin fixes and generates again. -->
<template>
  <UCard v-if="classId && termId && total" :ui="{ body: 'p-3 sm:p-4' }">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="min-w-0 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge v-for="s in shown" :key="s.status" :color="REPORT_CARD_REVIEW[s.status].color" variant="subtle"
            :icon="REPORT_CARD_REVIEW[s.status].icon" :label="`${s.count} ${REPORT_CARD_REVIEW[s.status].label.toLowerCase()}`" />
        </div>
        <p class="text-xs text-muted">
          <template v-if="!waiting && !returned">All {{ total }} cards are approved - parents can see them.</template>
          <template v-else-if="canReview">
            Open each card to add your comment, then approve them. If a score looks wrong, send them back to the admin.
          </template>
          <template v-else-if="waiting">Waiting for the class teacher to check and approve them. Parents see them once approved.</template>
          <template v-else>The class teacher sent these back. Fix the scores, then generate them again.</template>
        </p>
        <p v-if="lastNote" class="flex items-start gap-1.5 text-xs text-error">
          <UIcon name="i-lucide-message-square-warning" class="mt-0.5 size-3.5 shrink-0" />
          <span><b>{{ lastNote.by || 'Class teacher' }}:</b> {{ lastNote.note }}</span>
        </p>
      </div>

      <div v-if="canReview && waiting" class="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
        <!-- Approving signs the cards - nudge a class teacher who hasn't added a signature yet. -->
        <UAlert v-if="isTeacher && hasSignature === false" color="warning" variant="subtle" icon="i-lucide-pen-line"
          title="Add your signature first" description="It prints on each card you approve. Without it the line stays blank."
          :actions="[{ label: 'Add signature', to: '/profile#signature', color: 'warning', variant: 'soft' }]" />
      <div class="flex flex-wrap gap-2">
        <UButton icon="i-lucide-corner-up-left" color="neutral" variant="outline" label="Send back"
          :disabled="busy" @click="() => { returnOpen = true }" />
        <UButton icon="i-lucide-circle-check" color="success" :loading="busy" :label="`Approve ${waiting}`"
          @click="() => { approveOpen = true }" />
      </div>
      </div>
    </div>

    <UModal v-model:open="approveOpen" :title="`Approve ${waiting} report ${waiting === 1 ? 'card' : 'cards'}?`">
      <template #body>
        <p class="text-sm text-muted">
          They become final and parents can see and download them. Comments can't be changed after this unless the
          admin generates them again.
          <template v-if="isTeacher && hasSignature">Your signature goes on each card.</template>
        </p>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton color="success" icon="i-lucide-circle-check" :loading="busy" label="Approve" @click="decide('approve')" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="busy" @click="() => { approveOpen = false }" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="returnOpen" title="Send back to the admin">
      <template #body>
        <UFormField label="What needs fixing?" required help="The admin gets this with a notification.">
          <UTextarea v-model="note" :rows="3" autoresize class="w-full" maxlength="500"
            placeholder="e.g. Maths scores for Aminata and Musa look wrong" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton color="error" icon="i-lucide-corner-up-left" :loading="busy" :disabled="!note.trim()" label="Send back"
            @click="decide('return')" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="busy" @click="() => { returnOpen = false }" />
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
const { classId, termId, canReview = false } = defineProps<{
  classId?: string
  termId?: string
  // The class teacher (or an admin, for a class with no class teacher).
  canReview?: boolean
}>()

const emit = defineEmits<{ changed: [] }>()

const { success, error: toastError } = useNotify()
const { can } = useAuth()
const isTeacher = computed(() => can(Role.TEACHER))
// null = not checked yet
const hasSignature = ref<boolean | null>(null)

watch(() => canReview, async (yes) => {
  if (!yes || !isTeacher.value || hasSignature.value !== null) return
  try {
    hasSignature.value = !!(await TeacherApi().getMySignature())
  } catch {
    hasSignature.value = null
  }
}, { immediate: true })
const cards = ref<ReportCardSummary[]>([])
const busy = ref(false)
const approveOpen = ref(false)
const returnOpen = ref(false)
const note = ref('')

const count = (s: ReportCardReviewStatus) => cards.value.filter(c => (c.reviewStatus ?? 'APPROVED') === s).length
const total = computed(() => cards.value.length)
const waiting = computed(() => count('PENDING_REVIEW'))
const returned = computed(() => count('RETURNED'))
const shown = computed(() => (['PENDING_REVIEW', 'RETURNED', 'APPROVED'] as ReportCardReviewStatus[])
  .map(status => ({ status, count: count(status) }))
  .filter(s => s.count > 0))
const lastNote = computed(() => {
  const c = cards.value.find(x => x.reviewStatus === 'RETURNED' && x.reviewNote)
  return c ? { note: c.reviewNote!, by: c.reviewedByName } : null
})

async function load() {
  if (!classId || !termId) {
    cards.value = []
    return
  }
  try {
    const res = await ReportCardApi().fetchAll(1, 1000, { classId, termId })
    cards.value = (res?.data ?? []) as ReportCardSummary[]
  } catch {
    cards.value = []
  }
}

async function decide(decision: 'approve' | 'return') {
  if (!classId || !termId) return
  busy.value = true
  try {
    const res = await ReportCardApi().review(decision, { classId, termId, note: decision === 'return' ? note.value.trim() : undefined })
    if (!res) return
    success(decision === 'approve'
      ? `${res.count} report ${res.count === 1 ? 'card' : 'cards'} approved - parents can now see them`
      : `${res.count} report ${res.count === 1 ? 'card' : 'cards'} sent back to the admin`)
    approveOpen.value = false
    returnOpen.value = false
    note.value = ''
    await load()
    emit('changed')
  } catch (err: any) {
    const denied = /denied|forbidden|403/i.test(err?.message || '')
    toastError(denied
      ? 'Only the class teacher can do this. An admin can approve only when the class has no class teacher.'
      : err?.message || 'Something went wrong')
  } finally {
    busy.value = false
  }
}

watch(() => [classId, termId], load, { immediate: true })

defineExpose({ load })
</script>
