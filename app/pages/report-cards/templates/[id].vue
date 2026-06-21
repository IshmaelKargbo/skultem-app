<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <div class="flex items-center gap-3">

          <h1 class="text-2xl font-bold tracking-tight">
            {{ template.name }}
          </h1>

          <UBadge color="success" variant="subtle">
            {{ template.status }}
          </UBadge>

        </div>

        <p class="mt-1 text-sm text-muted">
          Preview how report cards generated with this template will appear.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/report-cards/templates">
          Back
        </UButton>

        <UButton icon="i-lucide-pencil" color="primary" :to="`/report-cards/templates/${template.id}/edit`">
          Edit Template
        </UButton>

        <UButton icon="i-lucide-download" variant="outline" color="neutral" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>

        <UButton icon="i-lucide-printer" variant="outline" color="neutral" @click="printTemplate">
          Print
        </UButton>

      </div>

    </div>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Template Details
              </h3>
            </div>
          </template>

          <dl class="divide-y divide-default">

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Type</dt>
              <dd class="text-sm font-medium">{{ template.type }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">School Level</dt>
              <dd class="text-sm font-medium">{{ template.level }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Created By</dt>
              <dd class="text-sm font-medium">{{ template.createdBy }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Updated</dt>
              <dd class="text-sm font-medium">{{ template.updatedAt }}</dd>
            </div>

          </dl>

        </UCard>

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-chart-column" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Sample Summary
              </h3>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-3">

            <div class="rounded-xl border border-default p-3.5 text-center">
              <p class="text-2xl font-bold">{{ template.subjects.length }}</p>
              <p class="text-xs text-muted">Subjects</p>
            </div>

            <div class="rounded-xl border border-default p-3.5 text-center">
              <p class="text-2xl font-bold">{{ averageScore }}%</p>
              <p class="text-xs text-muted">Average</p>
            </div>

          </div>

        </UCard>

      </div>

      <!-- Preview -->
      <div class="lg:col-span-2">

        <UCard :ui="{ body: 'p-0' }" class="overflow-hidden">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Preview
              </h3>
            </div>
          </template>

          <div id="report-card-preview" class="bg-white p-8 sm:p-10 text-gray-900">

            <!-- School Header -->
            <div class="text-center border-b border-gray-200 pb-6">

              <img
                v-if="template.school.logo"
                :src="template.school.logo"
                class="h-16 mx-auto object-contain"
                alt="School logo"
              >

              <h2 class="mt-3 text-xl font-bold tracking-wide">
                {{ template.school.name }}
              </h2>

              <p class="mt-1 text-xs font-medium uppercase tracking-widest text-gray-500">
                Report Card
              </p>

            </div>

            <!-- Student -->
            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">

              <div class="space-y-1.5">
                <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium">{{ template.student.name }}</span>
                </div>

                <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                  <span class="text-gray-500">Admission No.</span>
                  <span class="font-medium">{{ template.student.admissionNo }}</span>
                </div>

                <div class="flex justify-between gap-3">
                  <span class="text-gray-500">Class</span>
                  <span class="font-medium">{{ template.student.class }}</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                  <span class="text-gray-500">Term</span>
                  <span class="font-medium">{{ template.student.term }}</span>
                </div>

                <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                  <span class="text-gray-500">Session</span>
                  <span class="font-medium">{{ template.student.session }}</span>
                </div>

                <div class="flex justify-between gap-3">
                  <span class="text-gray-500">Position</span>
                  <span class="font-medium">{{ template.student.position }}</span>
                </div>
              </div>

            </div>

            <!-- Subjects -->
            <div class="mt-7">

              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-200 p-2.5 text-left font-semibold">Subject</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Score</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Grade</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="subject in template.subjects" :key="subject.name">
                    <td class="border border-gray-200 p-2.5">{{ subject.name }}</td>
                    <td class="border border-gray-200 p-2.5 text-center">{{ subject.score }}</td>
                    <td class="border border-gray-200 p-2.5 text-center font-medium">{{ subject.grade }}</td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr class="bg-gray-50">
                    <td class="border border-gray-200 p-2.5 font-semibold">Total / Average</td>
                    <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ totalScore }}</td>
                    <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ averageScore }}%</td>
                  </tr>
                </tfoot>
              </table>

            </div>

            <!-- Remarks -->
            <div class="mt-7 rounded-lg bg-gray-50 p-4">

              <h3 class="text-sm font-semibold">
                Class Teacher's Remark
              </h3>

              <p class="mt-1.5 text-sm text-gray-600">
                {{ template.remark }}
              </p>

            </div>

            <!-- Signatures -->
            <div class="mt-10 grid grid-cols-3 gap-6 text-center">

              <div>
                <div class="h-10 border-b border-gray-400" />
                <p class="text-xs mt-2 text-gray-500">
                  Class Teacher
                </p>
              </div>

              <div>
                <div class="h-10 border-b border-gray-400" />
                <p class="text-xs mt-2 text-gray-500">
                  Principal
                </p>
              </div>

              <div>
                <div class="h-10 border-b border-gray-400" />
                <p class="text-xs mt-2 text-gray-500">
                  Parent
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
const appStore = useAppStore()
const { success } = useNotify()

const templateId = computed(() => route.params.id)

const downloading = ref(false)

const template = ref({
  id: templateId.value,
  name: 'Primary School Template',
  status: 'Default',
  type: 'Primary',
  level: 'Primary School',
  createdBy: 'Administrator',
  updatedAt: 'Jun 17, 2026',

  school: {
    name: "KING'S WEST INTERNATIONAL SCHOOL",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
  },

  student: {
    name: 'John Kamara',
    admissionNo: 'KWIS001',
    class: 'JSS1-A',
    term: 'First Term',
    session: '2025/2026',
    position: '3rd'
  },

  subjects: [
    {
      name: 'Mathematics',
      score: 85,
      grade: 'A'
    },
    {
      name: 'English Language',
      score: 79,
      grade: 'B+'
    },
    {
      name: 'Integrated Science',
      score: 90,
      grade: 'A+'
    },
    {
      name: 'Social Studies',
      score: 74,
      grade: 'B'
    },
    {
      name: 'ICT',
      score: 88,
      grade: 'A'
    }
  ],

  remark: 'Excellent performance. Keep working hard.'
})

const totalScore = computed(() => {
  return template.value.subjects.reduce(
    (sum, subject) => sum + subject.score,
    0
  )
})

const averageScore = computed(() => {
  if (!template.value.subjects.length) {
    return 0
  }

  return (
    totalScore.value /
    template.value.subjects.length
  ).toFixed(1)
})

function printTemplate() {
  window.print()
}

async function downloadPdf() {
  try {
    downloading.value = true

    // TODO: Replace with actual PDF generation/export request
    await new Promise(resolve => setTimeout(resolve, 600))

    success('Report card downloaded')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  appStore.setTitle(
    `${template.value.name} Preview`
  )
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>