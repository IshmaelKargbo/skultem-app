<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading :title="scheme ? `${scheme.subject} (${scheme.session})` : 'Weekly Topics & Objectives'"
      :subtitle="scheme ? `${scheme.term} · Manage weekly curriculum coverage and lesson objectives.` : 'Manage weekly curriculum coverage and lesson objectives.'">
      <div class="flex flex-wrap items-center gap-3">
        <UBadge v-if="scheme" :label="scheme.state === 'PUBLISH' ? 'Published' : 'Draft'"
          :color="scheme.state === 'PUBLISH' ? 'success' : 'neutral'" variant="subtle" size="lg" />

        <!-- Publish makes the scheme visible on a parent's Curriculum page (draft schemes are
             hidden there - a family has no use for a still-being-built plan); a teacher keeps
             full access to their own scheme either way via GET /scheme/me. -->
        <UButton v-if="scheme && scheme.state === 'DRAFT'" icon="i-lucide-upload" color="primary" label="Publish"
          :loading="updatingState" @click="onPublish" />
        <UButton v-else-if="scheme" icon="i-lucide-corner-up-left" variant="outline" color="neutral"
          label="Move to Draft" :loading="updatingState" @click="onUnpublish" />

        <UButton v-if="isAdmin" icon="i-lucide-plus" label="Add Week" @click="add" />
      </div>
    </Heading>

    <!-- Statistics -->
    <CurriculumSchemeOfWorkStatistics />

    <!-- Weeks -->
    <div v-if="records.length" class="grid gap-5">

      <UCard v-for="week in records" :key="week.id">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">
                Week {{ week.week }}
              </h3>

              <p class="text-sm text-muted">
                {{ week.topic }}
              </p>
            </div>

            <UDropdownMenu :items="weekStateItems(week)" :content="{ align: 'end' }">
              <UBadge variant="outline" :color="getLessonStateColor(week.state)" :label="clean(week.state)"
                class="cursor-pointer" />
            </UDropdownMenu>
          </div>
        </template>


        <div class="space-y-5">
          <p v-if="week.subTopic" class="bg-gray-50 p-3 border-2 rounded-xl border-dashed border-gray-200 dark:border-gray-900">{{
            week.subTopic }}
          </p>
          <!-- Objectives -->
          <div>
            <p class="font-medium mb-3">
              Learning Objectives
            </p>

            <div class="space-y-2">

              <div v-for="objective in week.objectives" :key="objective" class="flex gap-2 text-sm text-muted">
                <UIcon name="i-lucide-check" class="text-primary mt-0.5" />

                {{ objective }}
              </div>

            </div>

          </div>
        </div>


        <template #footer>

          <div class="flex flex-wrap gap-3">
            <UButton size="sm" icon="i-lucide-eye" label="View" :to="`/curriculums/weeks/${week.id}`" />
          </div>

        </template>

      </UCard>
    </div>


    <!-- Empty -->
    <UCard v-else class="py-20">
      <div class="text-center">

        <UIcon name="i-lucide-book-open" class="text-6xl text-muted mx-auto" />

        <h3 class="mt-4 text-lg font-semibold">
          No weeks found
        </h3>

        <p class="text-sm text-muted mt-2">
          Create your first weekly topic.
        </p>

      </div>
    </UCard>

  </div>
</template>
<script setup lang="ts">
const store = useWeekStore()
const schemeStore = useSchemeOfWorkStore()
const { records } = storeToRefs(store)
const { record: scheme } = storeToRefs(schemeStore)
const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))
const { success, error: toastError } = useNotify()

const route = useRoute()
const id = computed(() => route.params.id as string)

const updatingState = ref(false)

async function onPublish() {
  updatingState.value = true
  try {
    await schemeStore.updateState(id.value, 'PUBLISH')
    success('Scheme of work published - it now shows on the parent portal.')
  } catch (err: any) {
    toastError(err?.message || err || 'Unable to publish scheme.')
  } finally {
    updatingState.value = false
  }
}

async function onUnpublish() {
  updatingState.value = true
  try {
    await schemeStore.updateState(id.value, 'DRAFT')
    success('Scheme of work moved back to draft.')
  } catch (err: any) {
    toastError(err?.message || err || 'Unable to update scheme.')
  } finally {
    updatingState.value = false
  }
}

function weekStateItems(week: Week) {
  const options: { label: string, value: LessonState, icon: string }[] = [
    { label: 'Not Started', value: 'NOT_STARTED', icon: 'i-lucide-circle-dashed' },
    { label: 'In Progress', value: 'IN_PROGRESS', icon: 'i-lucide-loader' },
    { label: 'Completed', value: 'COMPLETED', icon: 'i-lucide-check-circle' }
  ]

  return options
    .filter(o => o.value !== week.state)
    .map(o => ({
      label: o.label,
      icon: o.icon,
      onClick: () => onWeekStateChange(week.id, o.value)
    }))
}

async function onWeekStateChange(weekId: string, state: LessonState) {
  try {
    await store.updateState(weekId, state)
    useNotify().success('Week status updated.')
    await schemeStore.getProgress(id.value)
  } catch (error: any) {
    useNotify().error(error.message || error || 'Unable to update week status.')
  }
}

function add() {
  navigateTo(`${id.value}/week/add`)
}

watch(
  () => route.params.id,
  (schemeId) => {
    if (schemeId) {
      store.fetchAll(schemeId as string)
      schemeStore.fetchOne(schemeId as string)
    }
  },
  { immediate: true }
)

onMounted(() => {
  useAppStore().setTitle('Weekly Topics & Objectives')
  useAppStore().setBack('/curriculums')
  document.title = 'Weeks | Scheme of Work | Skultem'

})


definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})

</script>