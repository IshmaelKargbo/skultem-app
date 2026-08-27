<template>
  <div class="space-y-4 px-4 sm:px-6">
    <Heading title="Weekly Topic & Lesson Notes" subtitle="Manage this week's curriculum coverage and lesson notes.">

      <div class="space-x-3 items-center flex">
        <UDropdownMenu :items="weekStateItems" :content="{ align: 'start' }">
          <UBadge :color="getStatusColor(week?.state)" size="xl" variant="soft" class="p-1.5 px-3 rounded-xl cursor-pointer">
            {{ clean(week?.state || 'NOT_STARTED') }}
            <UIcon name="i-lucide-chevron-down" class="ml-1 size-3" />
          </UBadge>
        </UDropdownMenu>
        <UButton :icon="ADD_ICON" label="Write Lesson Note" @click="add" />
      </div>
    </Heading>

    <div class="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <!-- Sidebar -->
      <div class="self-start sticky top-6">
        <UCard class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="flex p-2.5 items-center justify-center rounded-xl bg-primary/10">
                <UIcon :name="WEEKS_ICON" class="size-6 text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">Week Information</h3>
                <p class="text-xs text-muted">
                  Scheme details and progress
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <!-- Week -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 p-3">
              <div class="flex p-2.5 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-calendar-range" class="size-6 text-primary" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs-base text-muted">Week Number</p>
                <p class="font-semibold text-sm">
                  Week {{ week?.week ?? '—' }}
                </p>
              </div>
            </div>

            <!-- Subject -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-800">
              <div class="flex p-2.5 items-center justify-center rounded-xl bg-info/10">
                <UIcon :name="SUBJECT_ICON" class="size-6 text-info" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs-base text-muted">Subject</p>
                <p class="truncate font-semibold text-sm">
                  {{ scheme?.subject ?? '—' }}
                </p>
              </div>
            </div>

            <!-- Class -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-800">
              <div class="flex p-2.5  items-center justify-center rounded-xl bg-warning/10">
                <UIcon :name="CLASS_ICON" class="size-7 text-warning" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs-base text-muted">Class</p>
                <p class="truncate text-sm font-semibold">
                  {{ scheme?.session ?? '—' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content -->
      <main class="space-y-4">
        <!-- Scheme Coverage -->
        <UCard :ui="{ body: 'sm:p-3' }">
          <div class="rounded-2xl bg-gray-50 p-5">
            <div class="mb-4 flex items-center justify-between">
              <div class="space-y-1.5">
                <p class="text-xs uppercase text-muted">Scheme Coverage</p>
                <h2 class="text-3xl font-bold text-primary">
                  {{ progress?.coverage ?? 0 }}%
                </h2>
              </div>

              <div class="flex p-2.5 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-chart-column" class="size-6 text-primary" />
              </div>
            </div>

            <UProgress :model-value="progress?.coverage ?? 0" size="lg" />
          </div>
        </UCard>

        <!-- Learning Objectives -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-target" class="text-primary" />
              <span class="font-semibold">Learning Objectives</span>
            </div>
          </template>

          <div v-if="week?.objectives?.length" class="space-y-2">
            <div v-for="objective in week.objectives" :key="objective" class="flex gap-2.5 items-center rounded-2xl bg-primary/5 p-3">
              <div class="flex p-1.5 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UIcon name="i-lucide-check" class="text-primary" />
              </div>

              <p class="flex-1 font-medium">
                {{ objective }}
              </p>
            </div>
          </div>

          <p v-else class="text-sm text-muted">
            No objectives recorded for this week.
          </p>
        </UCard>

        <!-- Lesson Notes -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-notebook-pen" class="text-primary" />
                <span class="font-semibold">Lesson Notes</span>
              </div>

              <UBadge variant="soft" color="neutral">
                {{ lessons.length }}
              </UBadge>
            </div>
          </template>

          <!-- Loading -->
          <div v-if="lessonsLoading" class="space-y-3">
            <USkeleton v-for="index in 2" :key="index" class="h-20 rounded-2xl" />
          </div>

          <!-- Lessons -->
          <div v-else-if="lessons.length" class="space-y-3">
            <div v-for="lesson in lessons" :key="lesson.id"
              class="cursor-pointer rounded-2xl border border-default p-4 transition-colors hover:bg-muted/30"
              @click="navigateTo(`/curriculums/lesson/${lesson.id}`)">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold">
                    {{ lesson.title }}
                  </p>

                  <p class="mt-1 truncate text-sm text-muted">
                    {{ lesson.content }}
                  </p>

                  <p class="mt-1 text-xs text-muted">
                    {{ formatDate(lesson.date) }}
                  </p>
                </div>

                <UDropdownMenu :items="lessonStateItems(lesson)" :content="{ align: 'end' }">
                  <UBadge :color="getStatusColor(lesson.state)" variant="soft" class="shrink-0 cursor-pointer"
                    @click.stop>
                    {{ clean(lesson.state) }}
                  </UBadge>
                </UDropdownMenu>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
            <UIcon name="i-lucide-notebook-pen" class="text-4xl text-muted" />

            <p class="text-sm text-muted">
              No lesson notes written for this week yet.
            </p>

            <UButton size="sm" variant="soft" :icon="ADD_ICON" label="Write the first one" @click="add" />
          </div>
        </UCard>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const weekStore = useWeekStore()
const lessonStore = useLessonStore()
const schemeStore = useSchemeOfWorkStore()
const notify = useNotify()
const appStore = useAppStore()

const { current: week } = storeToRefs(weekStore)
const { records: lessons, loading: lessonsLoading } = storeToRefs(lessonStore)
const { progress } = storeToRefs(schemeStore)

const weekId = computed(() => route.params.id as string)
const scheme = ref<SchemeOfWork>()

const stateOptions: {
  label: string
  value: LessonState
  icon: string
}[] = [
    {
      label: 'Not Started',
      value: 'NOT_STARTED',
      icon: 'i-lucide-circle-dashed',
    },
    {
      label: 'In Progress',
      value: 'IN_PROGRESS',
      icon: 'i-lucide-loader',
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
      icon: 'i-lucide-check-circle',
    },
  ]

const weekStateItems = computed(() =>
  stateOptions
    .filter(option => option.value !== week.value?.state)
    .map(option => ({
      label: option.label,
      icon: option.icon,
      onClick: () => onWeekStateChange(option.value),
    })),
)

function lessonStateItems(lesson: Lesson) {
  return stateOptions
    .filter(option => option.value !== lesson.state)
    .map(option => ({
      label: option.label,
      icon: option.icon,
      onClick: () => onLessonStateChange(lesson.id, option.value),
    }))
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success'

    case 'IN_PROGRESS':
      return 'warning'

    default:
      return 'neutral'
  }
}

async function onLessonStateChange(
  lessonId: string,
  state: LessonState,
) {
  try {
    await lessonStore.updateState(lessonId, state)
    notify.success('Lesson note updated.')
  } catch (error: any) {
    notify.error(
      error?.message || 'Unable to update lesson note.',
    )
  }
}

async function onWeekStateChange(state: LessonState) {
  try {
    await weekStore.updateState(weekId.value, state)
    notify.success('Week status updated.')

    if (week.value?.schemeId) {
      await schemeStore.getProgress(week.value.schemeId)
    }
  } catch (error: any) {
    notify.error(
      error?.message || 'Unable to update week status.',
    )
  }
}

function add() {
  navigateTo(`/curriculums/weeks/${weekId.value}/lesson/add`)
}

async function loadWeek(weekId: string) {
  scheme.value = undefined

  const result = await weekStore.getWeek(weekId)
  await lessonStore.fetchByWeek(weekId)

  if (result?.schemeId) {
    scheme.value = await CurriculumsApi().getScheme(result.schemeId)
    await schemeStore.getProgress(result.schemeId)
  }

  const title = `Week ${week.value?.week ?? ''}`

  appStore.setTitle(title)
  appStore.setBack(true)
  document.title = `${title} | Scheme of Work | Skultem`
}

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      await loadWeek(id as string)
    }
  },
  { immediate: true },
)

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER,
  ],
})
</script>