<template>
  <div class="space-y-4 px-4 sm:px-6">

    <!-- Header -->
    <UCard>
      <div v-if="loading" class="flex items-center gap-4">
        <USkeleton class="size-12 rounded-xl" />
        <div class="space-y-2">
          <USkeleton class="h-5 w-48" />
          <USkeleton class="h-4 w-64" />
        </div>
      </div>

      <div v-else-if="lesson" class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-1">
          <h1 class="text-xl font-bold">{{ lesson.title }}</h1>
          <p class="text-sm text-muted">
            Week {{ week?.week ?? '—' }} &middot; {{ lesson.topic }}
            <span v-if="lesson.subTopic"> &middot; {{ lesson.subTopic }}</span>
          </p>
        </div>
        <div class="flex items-end space-y-1 flex-col">
          <div>
            <UDropdownMenu :items="lessonStateItems()" :content="{ align: 'start' }">
              <UBadge size="lg" :color="getStatusColor(lesson.state)" variant="soft"
                class="p-1.5 px-3 rounded-xl cursor-pointer">
                {{ clean(lesson.state) }}
                <UIcon name="i-lucide-chevron-down" class="ml-1 size-3" />
              </UBadge>
            </UDropdownMenu>
          </div>
          <p class="mt-1 flex items-center gap-1.5 text-xs text-dimmed">
            <UIcon name="i-lucide-calendar" class="size-3.5" />
            {{ formatDate(lesson.date) }}
            <template v-if="lesson.duration">
              <span class="size-1 rounded-full bg-dimmed" />
              <UIcon name="i-lucide-clock" class="size-3.5" />
              {{ lesson.duration }}
            </template>
          </p>
        </div>
      </div>
    </UCard>

    <template v-if="loading">
      <div class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-2xl" />
      </div>
    </template>

    <template v-else-if="lesson">
      <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

        <!-- Sidebar -->
        <div class="space-y-6 xl:sticky xl:top-6 self-start">

          <!-- Focus -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-bookmark" class="text-primary" />
                <span class="font-semibold">Lesson Focus</span>
              </div>
            </template>

            <p class="text-sm">{{ lesson.content }}</p>
          </UCard>

          <!-- Previous knowledge -->
          <UCard v-if="lesson.previousKnowledge">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-brain" class="text-primary" />
                <span class="font-semibold">Previous Knowledge</span>
              </div>
            </template>

            <p class="text-sm">{{ lesson.previousKnowledge }}</p>
          </UCard>

          <!-- Teaching aids -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-briefcase" class="text-primary" />
                <span class="font-semibold">Teaching Aids</span>
              </div>
            </template>

            <ul v-if="lesson.teachingAids?.length" class="space-y-2">
              <li v-for="aid in lesson.teachingAids" :key="aid" class="flex items-center gap-2 text-sm">
                <UIcon name="i-lucide-dot" class="text-primary" />
                {{ aid }}
              </li>
            </ul>
            <p v-else class="text-sm text-muted">No teaching aids recorded.</p>
          </UCard>

          <!-- Reference materials -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-library" class="text-primary" />
                <span class="font-semibold">Reference Materials</span>
              </div>
            </template>

            <ul v-if="lesson.referenceMaterials?.length" class="space-y-2">
              <li v-for="ref in lesson.referenceMaterials" :key="ref" class="flex items-center gap-2 text-sm">
                <UIcon name="i-lucide-dot" class="text-primary" />
                {{ ref }}
              </li>
            </ul>
            <p v-else class="text-sm text-muted">No reference materials recorded.</p>
          </UCard>
        </div>

        <!-- Main content -->
        <div class="space-y-6">

          <!-- Objectives -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-target" class="text-primary" />
                <span class="font-semibold">Objectives</span>
              </div>
            </template>

            <div v-if="lesson.objectives?.length" class="space-y-3">
              <div v-for="objective in lesson.objectives" :key="objective"
                class="flex gap-2.5 rounded-2xl bg-primary/5 p-3 items-center">
                <div class="flex p-1.5 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-check" class="text-primary" />
                </div>
                <p class="font-medium">{{ objective }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-muted">No objectives recorded for this lesson.</p>
          </UCard>

          <!-- Presentation -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-presentation" class="text-primary" />
                <span class="font-semibold">Presentation</span>
              </div>
            </template>

            <div v-if="lesson.presentation?.length" class="space-y-4">
              <div v-for="(stage, index) in lesson.presentation" :key="stage.stage"
                class="overflow-hidden rounded-2xl border border-default">
                <div
                  class="flex items-center gap-2 border-b border-default bg-gray-100 px-4 py-2.5 dark:bg-neutral-800">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {{ index + 1 }}
                  </div>
                  <h4 class="text-sm font-semibold">{{ stage.stage }}</h4>
                </div>

                <div class="grid gap-4 p-4 sm:grid-cols-2">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-muted">Teacher's Activity</p>
                    <p class="mt-1 text-sm">{{ stage.teacherActivity || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-muted">Pupils' Activity</p>
                    <p class="mt-1 text-sm">{{ stage.pupilsActivity || '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted">No presentation stages recorded.</p>
          </UCard>

          <!-- Evaluation & Assignment -->
          <div class="grid gap-6 md:grid-cols-2">
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clipboard-check" class="text-primary" />
                  <span class="font-semibold">Evaluation</span>
                </div>
              </template>

              <p class="text-sm">{{ lesson.evaluation || 'No evaluation recorded.' }}</p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-pencil-line" class="text-primary" />
                  <span class="font-semibold">Assignment</span>
                </div>
              </template>

              <p class="text-sm">{{ lesson.assignment || 'No assignment recorded.' }}</p>
            </UCard>
          </div>

        </div>
      </div>
    </template>

    <UCard v-else class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-notebook-pen" class="mx-auto text-5xl text-muted" />
        <h3 class="mt-4 text-lg font-semibold">Lesson note not found</h3>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)

const lessonStore = useLessonStore()
const weekStore = useWeekStore()

const { current: lesson } = storeToRefs(lessonStore)
const { current: week } = storeToRefs(weekStore)

const loading = ref(true)

function lessonStateItems() {
  const options: { label: string, value: LessonState, icon: string }[] = [
    { label: 'Not Started', value: 'NOT_STARTED', icon: 'i-lucide-circle-dashed' },
    { label: 'In Progress', value: 'IN_PROGRESS', icon: 'i-lucide-loader' },
    { label: 'Completed', value: 'COMPLETED', icon: 'i-lucide-check-circle' }
  ]

  return options
    .filter(o => o.value !== lesson.value?.state)
    .map(o => ({
      label: o.label,
      icon: o.icon,
      onClick: () => onStateChange(o.value)
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

async function onStateChange(state: LessonState) {
  try {
    await lessonStore.updateState(id.value, state)
    useNotify().success('Lesson note updated.')
  } catch (error: any) {
    useNotify().error(error.message || error || 'Unable to update lesson note.')
  }
}

watch(
  () => route.params.id,
  async (lessonId) => {
    if (!lessonId) return

    loading.value = true
    try {
      const result = await lessonStore.getLesson(lessonId as string)

      if (result?.weekId)
        await weekStore.getWeek(result.weekId)
    } finally {
      loading.value = false
    }

    useAppStore().setTitle('Lesson Note')
    useAppStore().setBack(true)

    document.title = `${lesson.value?.title ?? 'Lesson Note'} | Skultem`
  },
  { immediate: true }
)

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})
</script>
