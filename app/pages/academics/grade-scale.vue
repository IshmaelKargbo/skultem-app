<template>
  <div class="md:p-7 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
    <Heading title="Grading scale" subtitle="Configure grade bands used for student grade and ranking calculation.">
      <UButton label="Add Band" icon="i-lucide-plus" @click="addGradeBand" />
    </Heading>
    <UCard>
      <div class="space-y-2">
        <div v-for="(band, index) in gradingBands" :key="`band-${index}`" class="flex space-x-2">
          <div class="grid grid-cols-3 gap-2 flex-1">
            <UInput type="number" v-model.number="band.maxScore" placeholder="Max" />
            <UInput type="number" v-model.number="band.minScore" placeholder="Min" />
            <UInput v-model="band.grade" placeholder="Grade" />
          </div>
          <UButton class="col-span-1" icon="i-lucide-trash-2" color="error" variant="ghost"
            :disabled="gradingBands.length <= 1" @click="removeGradeBand(index)" />
        </div>
      </div>
      <template #footer>
        <UButton label="Save Grading Scale" icon="i-lucide-save" color="info" variant="soft"
          :loading="isSavingGradingScale" @click="saveGradingScale" />
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const assessmentStore = useAssessmentStore()
const { error: toastError, success: toastSuccess } = useNotify()

const isRefreshing = ref(false)
const isSavingGradingScale = ref(false)

const gradingBands = ref<GradeBand[]>([])

async function loadGradingScale() {
  try {
    const res = await assessmentStore.fetchGradingScale()
    gradingBands.value = (res?.bands || []).map(band => ({ ...band }))
  } catch (error: any) {
    gradingBands.value = []
    toastError(error?.message || 'Failed to load grading scale')
  }
}

function addGradeBand() {
  gradingBands.value.push({ minScore: 0, maxScore: 0, grade: '' })
}

function removeGradeBand(index: number) {
  gradingBands.value.splice(index, 1)
}

async function saveGradingScale() {
  if (!gradingBands.value.length) return

  isSavingGradingScale.value = true
  try {
    const payload = {
      bands: gradingBands.value.map(band => ({
        minScore: Number(band.minScore),
        maxScore: Number(band.maxScore),
        grade: `${band.grade || ''}`.trim()
      }))
    }
    const res = await assessmentStore.updateGradingScale(payload)
    gradingBands.value = (res?.bands || []).map(band => ({ ...band }))
    toastSuccess('Grading scale updated successfully')
  } catch (error: any) {
    toastError(error?.message || 'Failed to update grading scale')
  } finally {
    isSavingGradingScale.value = false
  }
}

async function refreshAll() {
  isRefreshing.value = true
  try {
    await loadGradingScale()
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  appStore.setTitle('Academics')
  document.title = 'Grade Scale | Academics | Skultem'

  await refreshAll()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
