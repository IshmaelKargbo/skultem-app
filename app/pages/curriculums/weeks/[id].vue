<template>
  <div class="mt-6 space-y-6">

    <!-- Hero -->
    <UCard class="overflow-hidden">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex gap-4">

          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-calendar-range" class="text-3xl text-primary" />
          </div>

          <div>

            <div class="flex items-center gap-3">

              <h1 class="text-2xl font-bold">
                Week {{ week.week }}
              </h1>

              <UBadge color="success" variant="soft">
                {{ week.status }}
              </UBadge>

            </div>

            <p class="mt-1 text-sm text-muted">
              {{ week.topic }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">

              <UBadge variant="soft">
                Mathematics
              </UBadge>

              <UBadge variant="soft">
                JSS 1
              </UBadge>

              <UBadge variant="soft">
                75% Covered
              </UBadge>

            </div>

          </div>

        </div>

        <div class="flex gap-3">

          <UButton variant="outline" icon="i-lucide-arrow-left" to="/curriculums/weeks">
            Back
          </UButton>

          <UButton icon="i-lucide-pencil">
            Edit
          </UButton>

          <UButton variant="outline" icon="i-lucide-file-down">
            Export
          </UButton>

        </div>

      </div>
    </UCard>


    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Objectives
            </p>

            <h2 class="text-3xl font-bold">
              {{ week.objectives.length }}
            </h2>
          </div>

          <div class="rounded-2xl bg-primary/10 p-3">
            <UIcon name="i-lucide-target" class="text-primary text-xl" />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Activities
            </p>

            <h2 class="text-3xl font-bold">
              {{ week.activities.length }}
            </h2>
          </div>

          <div class="rounded-2xl bg-green-500/10 p-3">
            <UIcon name="i-lucide-users" class="text-green-600 text-xl" />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Assessment
            </p>

            <h2 class="font-semibold">
              {{ week.assessment }}
            </h2>
          </div>

          <div class="rounded-2xl bg-orange-500/10 p-3">
            <UIcon name="i-lucide-file-text" class="text-orange-500 text-xl" />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Coverage
            </p>

            <h2 class="text-3xl font-bold text-primary">
              75%
            </h2>
          </div>

          <div class="rounded-2xl bg-primary/10 p-3">
            <UIcon name="i-lucide-chart-column" class="text-primary text-xl" />
          </div>

        </div>
      </UCard>

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
        <UCard> <!-- Coverage -->
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


        <!-- Activities -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">

              <UIcon name="i-lucide-users" class="text-primary" />

              <span class="font-semibold">
                Teaching Activities
              </span>

            </div>
          </template>

          <div class="grid gap-3 md:grid-cols-2">

            <div v-for="activity in week.activities" :key="activity"
              class="rounded-2xl border border-default bg-gray-50 p-4">

              <div class="flex items-center gap-3">

                <div class="rounded-xl bg-primary/10 p-2">
                  <UIcon name="i-lucide-users" class="text-primary" />
                </div>

                <div>

                  <p class="font-medium">
                    {{ activity }}
                  </p>

                  <p class="text-xs text-muted">
                    Classroom activity
                  </p>

                </div>

              </div>

            </div>

          </div>

        </UCard>


        <!-- Assessment -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">

              <UIcon name="i-lucide-clipboard-check" class="text-primary" />

              <span class="font-semibold">
                Assessment
              </span>

            </div>
          </template>

          <div class="rounded-2xl bg-orange-500/10 p-6">

            <div class="flex items-center gap-4">

              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <UIcon name="i-lucide-file-text" class="text-xl text-orange-500" />
              </div>

              <div>

                <h3 class="font-semibold">
                  {{ week.assessment }}
                </h3>

                <p class="text-sm text-muted">
                  Student evaluation activity.
                </p>

              </div>

            </div>

          </div>

        </UCard>

        <UCard>

          <!-- Quick Actions -->
          <div class="space-y-3">

            <UButton block variant="soft" icon="i-lucide-pencil">
              Edit Week
            </UButton>

            <UButton block variant="soft" color="warning" icon="i-lucide-file-down">
              Export PDF
            </UButton>

          </div>

        </UCard>
      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const route = useRoute()

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