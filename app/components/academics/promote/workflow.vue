<script setup lang="ts">
const classStore = useClassSessionStore()
const promotionStore = usePromotionStore()
const { list: classOptions } = storeToRefs(classStore)
const { candidates, loadingCandidates, usingDemoData } = storeToRefs(promotionStore)
const { success: toastSuccess, error: toastError } = useNotify()

const fromClass = ref('')
const toClass = ref('')
const confirmModal = ref(false)
const confirming = ref(false)

const fromClassName = computed(() => classOptions.value.find(e => e.value === fromClass.value)?.label || '')
const toClassName = computed(() => classOptions.value.find(e => e.value === toClass.value)?.label || '')

const targetOptions = computed(() => classOptions.value.filter(e => e.value !== fromClass.value))

const promotingCount = computed(() => candidates.value.filter(e => e.outcome === 'PROMOTE').length)
const repeatingCount = computed(() => candidates.value.filter(e => e.outcome === 'REPEAT').length)
const graduatingCount = computed(() => candidates.value.filter(e => e.outcome === 'GRADUATE').length)

const canConfirm = computed(() => !!fromClass.value && candidates.value.length > 0 && !loadingCandidates.value)

watch(fromClass, async (value) => {
  if (!value) return
  await promotionStore.loadCandidates(value)
})

watch(toClass, (value) => {
  if (value) promotionStore.applyBulkTarget(value)
})

function setOutcome(studentId: string, outcome: PromotionOutcome) {
  promotionStore.setOutcome(studentId, outcome)
  if (outcome === 'PROMOTE' && toClass.value) {
    promotionStore.setTarget(studentId, toClass.value)
  }
}

async function confirm() {
  if (!fromClass.value) return

  confirming.value = true
  try {
    promotionStore.confirmPromotion(fromClass.value, fromClassName.value, toClassName.value || 'Various classes')
    toastSuccess(
      usingDemoData
        ? `Promotion batch recorded for ${fromClassName.value} (sample data)`
        : `Promotion batch recorded for ${fromClassName.value}`
    )
    confirmModal.value = false
    fromClass.value = ''
    toClass.value = ''
  } catch (err: any) {
    toastError(err?.message || 'Failed to record promotion')
  } finally {
    confirming.value = false
  }
}

onMounted(() => classStore.fetchAll(0, 0))
</script>

<template>
  <div class="space-y-4">
    <UAlert
      color="info"
      variant="soft"
      icon="i-lucide-info"
      title="Promotions are staged for review"
      description="Confirming records a promotion batch below for tracking. Automatic re-assignment of student class records isn't wired up yet, so update each student's class from the Students section once you're ready."
    />

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="From Class" required>
          <USelectMenu v-model="fromClass" value-key="value" :items="classOptions" placeholder="Select current class" :loading="classStore.loading" class="w-full" />
        </UFormField>

        <UFormField label="Promote To" hint="Default target class — can be overridden per student">
          <USelectMenu v-model="toClass" value-key="value" :items="targetOptions" placeholder="Select target class" :disabled="!fromClass" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="fromClass" :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold">Students in {{ fromClassName }}</h3>
            <UBadge v-if="usingDemoData" color="neutral" variant="subtle" icon="i-lucide-flask-conical" size="sm">
              Sample data
            </UBadge>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="success" variant="subtle">{{ promotingCount }} Promoting</UBadge>
            <UBadge color="warning" variant="subtle">{{ repeatingCount }} Repeating</UBadge>
            <UBadge color="info" variant="subtle">{{ graduatingCount }} Graduating</UBadge>
          </div>
        </div>
      </template>

      <UAlert
        v-if="usingDemoData"
        color="warning"
        variant="soft"
        icon="i-lucide-flask-conical"
        title="Showing sample students"
        description="No enrolled students were found for this class, so sample students are shown for demo purposes. They won't be saved to any real records."
        class="m-4 mb-0"
      />

      <div v-if="loadingCandidates" class="space-y-3 p-4">
        <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-xl" />
      </div>

      <div v-else-if="!candidates.length" class="flex flex-col items-center gap-3 py-16">
        <UIcon :name="PROMOTE_STUDENTS_ICON" class="text-4xl text-muted" />
        <h3 class="font-semibold text-highlighted">No students found</h3>
        <p class="text-sm text-muted">This class has no enrolled students to promote.</p>
      </div>

      <ul v-else class="divide-y divide-default">
        <li v-for="candidate in candidates" :key="candidate.studentId" class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="font-medium text-highlighted">{{ candidate.name }}</p>
            <p class="text-xs text-muted">Admission No. {{ candidate.admissionNumber }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <USelectMenu
              :model-value="candidate.outcome"
              value-key="value"
              :items="promotionOutcomes"
              size="sm"
              class="w-36"
              @update:model-value="(v: any) => setOutcome(candidate.studentId, v)"
            />

            <USelectMenu
              v-if="candidate.outcome === 'PROMOTE'"
              :model-value="candidate.targetClassId"
              value-key="value"
              :items="targetOptions"
              placeholder="Target class"
              size="sm"
              class="w-44"
              @update:model-value="(v: any) => promotionStore.setTarget(candidate.studentId, v)"
            />
          </div>
        </li>
      </ul>

      <template #footer>
        <div class="flex justify-end">
          <UButton :icon="PROMOTE_STUDENTS_ICON" label="Confirm Promotion" :disabled="!canConfirm" @click="confirmModal = true" />
        </div>
      </template>
    </UCard>

    <UModal v-model:open="confirmModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Confirm Promotion</h3>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              You're about to record a promotion batch for <strong>{{ fromClassName }}</strong>:
            </p>

            <ul class="space-y-1 text-sm">
              <li><strong>{{ promotingCount }}</strong> students promoting{{ toClassName ? ` to ${toClassName}` : '' }}</li>
              <li><strong>{{ repeatingCount }}</strong> students repeating {{ fromClassName }}</li>
              <li><strong>{{ graduatingCount }}</strong> students graduating</li>
            </ul>
          </div>

          <template #footer>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <UButton label="Cancel" variant="soft" color="neutral" @click="confirmModal = false" />
              <UButton label="Confirm Promotion" :loading="confirming" @click="confirm" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
