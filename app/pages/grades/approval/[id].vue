<template>
  <div class="px-4 md:px-6">
    <!-- Mirrors GradesViewRequest's card: banner, identity, stats, distribution, score table. -->
    <UCard v-if="loading" class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <div class="h-14 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10" />
      <div class="space-y-6 px-5 pb-5">
        <div class="-mt-7 flex items-center justify-between gap-3">
          <div class="space-y-2">
            <USkeleton class="h-3 w-56 max-w-full" />
            <USkeleton class="h-5 w-40" />
            <USkeleton class="h-4 w-24" />
          </div>
          <USkeleton class="h-7 w-28 rounded-full" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div v-for="i in 3" :key="i" class="flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/40 p-3">
            <USkeleton class="h-6 w-10" />
            <USkeleton class="h-3 w-16" />
          </div>
        </div>

        <div>
          <USkeleton class="mb-2 h-4 w-36" />
          <USkeleton class="h-3 w-full rounded-full" />
        </div>

        <div>
          <USkeleton class="mb-2 h-4 w-28" />
          <div class="overflow-hidden rounded-xl border border-default">
            <div class="h-9 bg-elevated/60" />
            <div v-for="i in 6" :key="i" class="flex items-center gap-2 border-t border-default p-2">
              <USkeleton class="size-6 shrink-0 rounded-full" />
              <USkeleton class="h-4 flex-1 max-w-48" />
              <USkeleton class="ml-auto h-4 w-10" />
              <USkeleton class="h-5 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <div v-else-if="!record" class="mx-auto max-w-3xl">
      <UCard>
        <div class="flex flex-col items-center gap-3 py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="i-lucide-file-question" class="text-3xl text-primary-500" />
          </div>
          <p class="text-sm font-semibold text-highlighted">Request not found</p>
          <p class="max-w-xs text-xs text-muted">It may have been withdrawn, or you may not have access to it.</p>
          <UButton to="/grades/approval" label="Back to Grade Approval" icon="i-lucide-arrow-left" color="primary"
            variant="soft" />
        </div>
      </UCard>
    </div>

    <GradesViewRequest v-else :record="record" @refresh="reload" @close="goBack" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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

async function reload() {
  await load()
}

function goBack() {
  router.back()
}

onMounted(() => {
  useAppStore().setTitle('Approval Details')
  useAppStore().setBack(true)
  document.title = 'Approval Details | Grades | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
