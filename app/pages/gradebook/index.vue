<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- Which class: a class master's own (usually one), or any class for management and the exam office. -->
    <Heading :title="seesAll ? 'Grade Book' : 'My Class Grade Book'" subtitle="Select a class to view its grade book">
      <div v-if="options.length > 1" class="flex flex-wrap items-center gap-2">
        <USelectMenu v-model="sessionId" :items="options" value-key="value" class="w-64"
          :search-input="options.length > 8 ? { placeholder: 'Find a class' } : false" />
      </div>
    </Heading>
    <GradesSectionNav />

    <GradebookSkeleton v-if="loadingOptions" />
    <div v-else-if="!options.length" class="rounded-3xl border border-dashed border-default p-10 text-center">
      <UIcon name="i-lucide-book-open-check" class="mx-auto size-8 text-muted" />
      <p class="mt-2 text-sm font-medium text-highlighted">No class to show</p>
      <p class="mt-1 text-xs text-muted">The grade book is for a class's class master. You aren't class master of a
        class this year.</p>
    </div>
    <GradebookBook v-else-if="sessionId" :key="sessionId" :session-id="sessionId"
      :term-id="(route.query.termId as string) || undefined"
      :initial-source="route.query.source === 'cards' ? 'cards' : 'live'" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { can } = useAuth()

// Management and the exam office see every class; a teacher, the classes they're class master of.
const seesAll = computed(() => can([Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.EXAM_OFFICER]))
const options = ref<{ label: string, value: string }[]>([])
const loadingOptions = ref(true)
const sessionId = ref<string>((route.query.session as string) || '')

// Keep the chosen class in the address, so a refresh or a shared link opens the same one.
watch(sessionId, (id) => {
  if (id && route.query.session !== id) router.replace({ query: { ...route.query, session: id } })
})

async function loadOptions() {
  loadingOptions.value = true
  try {
    if (seesAll.value) {
      const res = await ClassApi().getAllClassSessions(1, 300)
      options.value = (res?.data ?? []).map((s: any) => ({
        value: s.id,
        label: [s.clazz, s.sectionName, s.streamName && s.streamName !== 'N/A' ? s.streamName : null].filter(Boolean).join(' · ')
      }))
    } else {
      const mine = await TeacherApi().getMyClassMasterAssignments() ?? []
      options.value = mine.map((m: any) => ({ value: m.sessionId, label: m.sessionName || m.className }))
    }
  } finally {
    loadingOptions.value = false
  }
  if (!options.value.some(o => o.value === sessionId.value)) sessionId.value = options.value[0]?.value ?? ''
}

onMounted(() => {
  useAppStore().setTitle('Grade Book')
  document.title = 'Grade Book | Grades | Skultem'
  loadOptions()
})

definePageMeta({
  role: [Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.EXAM_OFFICER, Role.TEACHER]
})
</script>
