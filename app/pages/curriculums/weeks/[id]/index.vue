<template>
  <div class="space-y-4 p-4">
    <Heading title="Weekly Topics & Lessions" subtitle="Manage weekly curriculum coverage and lesson objectives.">
      <div class="flex gap-3">
        <UButton :icon="ADD_ICON" @click="add" label="Add Lession" />
      </div>
    </Heading>
    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'info',
        label: 'Lessions',
        isReady: isReady,
        value: '0',
        icon: TARGET_ICON
      }" />
      <Metric :record="{
        color: 'success',
        label: 'Completed',
        isReady: isReady,
        value: '0',
        icon: CHECK_ICON
      }" />

      <Metric :record="{
        color: 'warning',
        label: 'Remaining',
        isReady: isReady,
        value: '0',
        icon: PENDING_ICON
      }" />

      <Metric :record="{
        color: 'primary',
        label: 'Coverage',
        isReady: isReady,
        value: '0%',
        icon: COVERAGE_ICON
      }" />
    </div>


    <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

      <!-- Sidebar -->
      <div>
        <UCard class="sticky top-6 overflow-hidden">
          <template #header>
            <div class="flex items-center gap-3">

              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-info" class="text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">
                  Week Information
                </h3>

                <p class="text-xs text-muted">
                  Scheme details and progress
                </p>
              </div>

            </div>
          </template>


          <div class="space-y-4">

            <!-- Week -->
            <div class="flex items-center gap-3 rounded-2xl bg-primary/5 p-4">

              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-calendar-range" class="text-primary" />
              </div>

              <div class="flex-1">
                <p class="text-xs text-muted">
                  Week Number
                </p>

                <p class="font-semibold">
                  Week {{ week.week }}
                </p>
              </div>

            </div>


            <!-- Subject -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-green-800 p-4">

              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <UIcon name="i-lucide-book-open" class="text-blue-500" />
              </div>

              <div class="flex-1">
                <p class="text-xs text-muted">
                  Subject
                </p>

                <p class="font-semibold">
                  Mathematics
                </p>
              </div>

            </div>


            <!-- Class -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-green-800 p-4">

              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
                <UIcon name="i-lucide-school" class="text-green-600" />
              </div>

              <div class="flex-1">
                <p class="text-xs text-muted">
                  Class
                </p>

                <p class="font-semibold">
                  JSS 1
                </p>
              </div>

            </div>


            <!-- Status -->
            <div class="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-green-800 p-4">

              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
                <UIcon name="i-lucide-check-circle" class="text-green-600" />
              </div>

              <div class="flex-1">
                <p class="text-xs text-muted">
                  Status
                </p>

                <UBadge color="success" size="sm" variant="soft">
                  {{ week.status }}
                </UBadge>
              </div>

            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content -->
      <div class="space-y-6">
        <UCard :ui="{
          body: 'sm:p-3'
        }"> <!-- Coverage -->
          <div class="rounded-2xl bg-primary/5 p-5">

            <div class="flex items-center justify-between mb-4">

              <div>
                <p class="text-sm text-muted">
                  Curriculum Coverage
                </p>

                <h2 class="text-3xl font-bold text-primary">
                  75%
                </h2>
              </div>

              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-chart-column" class="text-primary text-xl" />
              </div>

            </div>

            <UProgress :model-value="75" size="lg" />

          </div>
        </UCard>
        <!-- Learning Objectives -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">

              <UIcon name="i-lucide-target" class="text-primary" />

              <span class="font-semibold">
                Learning Objectives
              </span>

            </div>
          </template>

          <div class="space-y-3">

            <div v-for="objective in week.objectives" :key="objective" class="flex gap-4 rounded-2xl bg-primary/5 p-4">

              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-check" class="text-primary" />
              </div>

              <div class="flex-1">
                <p class="font-medium">
                  {{ objective }}
                </p>
              </div>

            </div>

          </div>

        </UCard>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const isReady = ref(true)

const id = route.params.id as string

const week = reactive({
  id: route.params.id,
  week: 1,
  topic: 'Whole Numbers',
  objectives: [
    'Understand whole numbers',
    'Compare numbers',
    'Write numbers in words'
  ],
  activities: [
    'Discussion',
    'Group Work',
    'Examples'
  ],
  assessment: 'Quiz',
  status: 'Completed'
})

function add() {
  navigateTo(`/curriculums/weeks/${id}/lesson/add`)
}

onMounted(() => {
  useAppStore().setTitle(`Week ${week.week}`)

  document.title =
    `Week ${week.week} | Scheme of Work | Skultem`
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