<template>
  <div class="px-4 md:px-6">
    <div v-if="loading" class="mx-auto max-w-3xl space-y-4">
      <USkeleton class="h-14 w-full rounded-2xl" />
      <USkeleton class="h-64 w-full rounded-2xl" />
    </div>

    <div v-else-if="!record" class="mx-auto max-w-3xl">
      <UCard>
        <div class="flex flex-col items-center gap-3 py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="i-lucide-file-question" class="text-3xl text-primary-500" />
          </div>
          <p class="text-sm font-semibold text-highlighted">Request not found</p>
          <p class="max-w-xs text-xs text-muted">It may have been withdrawn, or you may not have access to it.</p>
          <UButton to="/grades/approval" label="Back to Grade Approval" icon="i-lucide-arrow-left" color="primary" variant="soft" />
        </div>
      </UCard>
    </div>

    <div v-else class="mx-auto max-w-3xl">
      <GradesViewRequest :record="record" @refresh="reload" @close="goBack" />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const id = computed(() => String(route.params.id))
const record = ref<AssessmentApprovalRequest | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    record.value = await AssessmentApi().getAssessmentApprovalRequest(id.value) ?? null
  } finally {
    loading.value = false
  }
}

// After approve/return, GradesViewRequest's own store call already updated the request - just
// re-fetch this one record rather than reloading the whole list it was opened from.
async function reload() {
  await load()
}

function goBack() {
  navigateTo('/grades/approval')
}

onMounted(() => {
  useAppStore().setTitle('Approval Details')
  useAppStore().setBack('/grades/approval')
  document.title = 'Approval Details | Grades | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR, Role.OWNER]
})
</script>
