<template>
  <div class="space-y-4 p-4">

    <!-- Header -->
    <UCard class="overflow-hidden">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex gap-4">

          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-book-open" class="text-3xl text-primary" />
          </div>

          <div>

            <div class="flex flex-wrap items-center gap-3">

              <h1 class="text-2xl font-bold">
                Mathematics
              </h1>

              <UBadge color="primary" label="On Track" />

            </div>

            <p class="mt-1 text-sm text-muted">
              JSS 1 • Term 1 • 2026/2027
            </p>

            <div class="mt-4 flex flex-wrap gap-2">

              <UBadge variant="soft" color="success" label="9 Weeks Completed" />

              <UBadge variant="soft" color="warning" label="3 Weeks Remaining" />

            </div>

          </div>

        </div>

        <div class="flex gap-3">

          <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/curriculums/student-progress">
            Back
          </UButton>

          <UButton icon="i-lucide-file-down">
            Export PDF
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
              Coverage
            </p>

            <p class="text-3xl font-bold text-primary">
              75%
            </p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon name="i-lucide-chart-column" class="text-primary text-xl" />
          </div>

        </div>

      </UCard>


      <UCard>

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Completed
            </p>

            <p class="text-3xl font-bold text-green-600">
              9
            </p>
          </div>

          <div class="rounded-xl bg-green-500/10 p-3">
            <UIcon name="i-lucide-check-circle" class="text-green-500 text-xl" />
          </div>

        </div>

      </UCard>


      <UCard>

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Remaining
            </p>

            <p class="text-3xl font-bold text-orange-500">
              3
            </p>
          </div>

          <div class="rounded-xl bg-orange-500/10 p-3">
            <UIcon name="i-lucide-clock" class="text-orange-500 text-xl" />
          </div>

        </div>

      </UCard>


      <UCard>

        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Lesson Plans
            </p>

            <p class="text-3xl font-bold">
              18
            </p>
          </div>

          <div class="rounded-xl bg-blue-500/10 p-3">
            <UIcon name="i-lucide-book-check" class="text-blue-500 text-xl" />
          </div>

        </div>

      </UCard>

    </div>

    <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

      <!-- LEFT SIDEBAR -->
      <div class="space-y-6 xl:sticky xl:top-6 self-start">

        <!-- Subject Summary -->
        <UCard class="overflow-hidden">

          <div class="border-b border-gray-200 dark:border-gray-800 -mx-6 -mt-6 mb-6 p-6">

            <div class="flex items-center gap-4">

              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <UIcon name="i-lucide-calculator" class="text-3xl text-primary" />
              </div>

              <div>

                <h2 class="text-xl font-bold">
                  Mathematics
                </h2>

                <p class="text-sm text-muted">
                  JSS 1 • Term 1
                </p>

              </div>

            </div>

          </div>


          <div class="space-y-4">

            <div class="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

              <div class="rounded-xl bg-blue-500/10 p-3">
                <UIcon name="i-lucide-user" class="text-blue-500" />
              </div>

              <div>
                <p class="text-xs text-muted">
                  Teacher
                </p>

                <p class="font-medium">
                  Mr. Kargbo
                </p>
              </div>

            </div>


            <div class="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

              <div class="rounded-xl bg-orange-500/10 p-3">
                <UIcon name="i-lucide-school" class="text-orange-500" />
              </div>

              <div>
                <p class="text-xs text-muted">
                  Class
                </p>

                <p class="font-medium">
                  JSS 1
                </p>
              </div>

            </div>


            <div class="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

              <div class="rounded-xl bg-green-500/10 p-3">
                <UIcon name="i-lucide-calendar" class="text-green-500" />
              </div>

              <div>
                <p class="text-xs text-muted">
                  Academic Year
                </p>

                <p class="font-medium">
                  2026 / 2027
                </p>
              </div>

            </div>


            <div class="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

              <div class="rounded-xl bg-purple-500/10 p-3">
                <UIcon name="i-lucide-clock-3" class="text-purple-500" />
              </div>

              <div>
                <p class="text-xs text-muted">
                  Status
                </p>

                <UBadge color="primary" label="On Track" />
              </div>

            </div>

          </div>

        </UCard>

      </div>


      <!-- RIGHT CONTENT -->
      <div class="space-y-6">

        <!-- Progress Summary -->
        <UCard>

          <template #header>

            <div class="flex items-center gap-2">

              <UIcon name="i-lucide-activity" class="text-primary" />

              <span class="font-semibold">
                Progress Summary
              </span>

            </div>

          </template>

          <div class="space-y-5">

            <div>

              <div class="mb-2 flex justify-between">

                <span class="text-sm text-muted">
                  Coverage
                </span>

                <span class="font-bold text-primary">
                  75%
                </span>

              </div>

              <UProgress :model-value="75" size="lg" />

            </div>


            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-xl bg-green-500/10 p-4 text-center">

                <p class="text-2xl font-bold text-green-600">
                  9
                </p>

                <p class="text-xs text-muted">
                  Completed
                </p>

              </div>


              <div class="rounded-xl bg-orange-500/10 p-4 text-center">

                <p class="text-2xl font-bold text-orange-500">
                  3
                </p>

                <p class="text-xs text-muted">
                  Remaining
                </p>

              </div>

            </div>

          </div>

        </UCard>



        <!-- Weekly Timeline -->
        <UCard>

          <template #header>

            <div class="flex items-center gap-2">

              <UIcon name="i-lucide-calendar-days" class="text-primary" />

              <span class="font-semibold">
                Weekly Topics
              </span>

            </div>

          </template>

          <div class="space-y-4">

            <div v-for="week in weeks" :key="week.id" class="rounded-2xl border border-gray-200 dark:border-gray-800  p-5 transition hover:bg-muted/40">

              <div class="flex justify-between">

                <div class="flex gap-4">

                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <span class="font-bold">
                      {{ week.week }}
                    </span>
                  </div>

                  <div>

                    <h3 class="font-semibold">
                      Week {{ week.week }}
                    </h3>

                    <p class="text-sm text-muted">
                      {{ week.topic }}
                    </p>

                    <div class="mt-3 flex flex-wrap gap-2">

                      <UBadge variant="soft" label="Lesson Plan Ready" />

                      <UBadge variant="soft" color="info" label="Assessment" />

                    </div>

                  </div>

                </div>

               <div>
                 <UBadge :label="week.status" :color="week.color" />
               </div>

              </div>

            </div>

          </div>

        </UCard>


        <!-- Quick Actions -->
        <UCard>

          <template #header>
            <span class="font-semibold">
              Quick Actions
            </span>
          </template>

          <div class="space-y-3">

            <UButton block size="lg" variant="soft" icon="i-lucide-calendar-days">
              Weekly Topics
            </UButton>

            <UButton block size="lg" color="success" variant="soft" icon="i-lucide-book-open-check">
              Lesson Plans
            </UButton>

            <UButton block size="lg" color="warning" variant="soft" icon="i-lucide-chart-column">
              Reports
            </UButton>

          </div>

        </UCard>


      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const weeks = ref([
  {
    id: 1,
    week: 1,
    topic: 'Whole Numbers',
    status: 'Completed',
    color: 'success'
  },
  {
    id: 2,
    week: 2,
    topic: 'Factors and Multiples',
    status: 'Completed',
    color: 'success'
  },
  {
    id: 3,
    week: 3,
    topic: 'Fractions',
    status: 'In Progress',
    color: 'warning'
  },
  {
    id: 4,
    week: 4,
    topic: 'Decimals',
    status: 'Pending',
    color: 'neutral'
  }
])

onMounted(() => {
  useAppStore().setTitle('Subject Progress')

  document.title =
    'Subject Progress | Skultem'
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