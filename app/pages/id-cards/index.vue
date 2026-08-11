<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <Heading title="ID Cards" subtitle="Generate and manage student and staff identification cards.">
      <UButton icon="i-lucide-plus" color="primary" to="/id-cards/generate" class="justify-center">
        Generate ID Cards
      </UButton>

      <UButton icon="i-lucide-printer" variant="outline" class="justify-center" @click="printAll">
        Print All
      </UButton>

      <UButton icon="i-lucide-download" variant="outline" class="justify-center" @click="exportAll">
        Export PDF
      </UButton>
    </Heading>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-id-card" class="text-primary text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Total Cards
            </p>

            <h3 class="text-2xl font-bold">
              1,250
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-green-500/10">
            <UIcon name="i-lucide-check-circle" class="text-green-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Printed
            </p>

            <h3 class="text-2xl font-bold">
              1,100
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-yellow-500/10">
            <UIcon name="i-lucide-clock" class="text-yellow-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Pending
            </p>

            <h3 class="text-2xl font-bold">
              150
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
            <UIcon name="i-lucide-users" class="text-purple-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Active Students
            </p>

            <h3 class="text-2xl font-bold">
              1,250
            </h3>
          </div>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-5">

        <UInput v-model="search" icon="i-lucide-search" placeholder="Search student..." />

        <USelect v-model="selectedClass" :items="['All Classes', 'JSS1', 'JSS2', 'JSS3', 'SSS1']" placeholder="Class" />

        <USelect v-model="selectedType" :items="['All Types', 'Student', 'Teacher', 'Staff']" placeholder="Type" />

        <USelect v-model="selectedStatus" :items="['All Statuses', 'Generated', 'Pending']" placeholder="Status" />

        <UButton icon="i-lucide-x" variant="outline" label="Clear" @click="resetFilters" />

      </div>

    </UCard>

    <!-- Cards -->
    <div v-if="filteredStudents.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard v-for="student in filteredStudents" :key="student.id" variant="outline" class="rounded-3xl overflow-hidden">

        <div class="flex gap-4">

          <UAvatar size="3xl" :alt="student.name" />

          <div>

            <h3 class="font-semibold">
              {{ student.name }}
            </h3>

            <p class="text-sm text-muted">
              {{ student.class }}
            </p>

            <UBadge color="primary" variant="soft" class="mt-2">
              {{ student.admissionNo }}
            </UBadge>

          </div>

        </div>

        <div class="mt-6 flex gap-2">
          <UButton block icon="i-lucide-eye" variant="soft" :to="`/id-cards/${student.id}`">
            Preview
          </UButton>

          <UButton block icon="i-lucide-printer" variant="outline" @click="printOne(student)">
            Print
          </UButton>

          <UButton block icon="i-lucide-download" variant="outline" @click="exportOne(student)">
            PDF
          </UButton>

        </div>

      </UCard>

    </div>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-lucide-id-card" class="mb-3 size-12 text-muted" />
        <h3 class="text-base font-semibold">No students match these filters</h3>
        <p class="mt-1 text-sm text-muted">Try adjusting your search or clearing the filters.</p>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const { info } = useNotify()

const search = ref('')
const selectedClass = ref('All Classes')
const selectedType = ref('All Types')
const selectedStatus = ref('All Statuses')

const students = ref([
  {
    id: 1,
    name: 'John Kamara',
    class: 'JSS1-A',
    admissionNo: 'KWIS001'
  },
  {
    id: 2,
    name: 'Fatmata Sesay',
    class: 'JSS2-B',
    admissionNo: 'KWIS002'
  },
  {
    id: 3,
    name: 'Mohamed Koroma',
    class: 'SSS1-A',
    admissionNo: 'KWIS003'
  }
])

const filteredStudents = computed(() =>
  students.value.filter((student) => {
    const matchesSearch = !search.value
      || student.name.toLowerCase().includes(search.value.toLowerCase())
      || student.admissionNo.toLowerCase().includes(search.value.toLowerCase())

    const matchesClass = selectedClass.value === 'All Classes'
      || student.class.startsWith(selectedClass.value)

    return matchesSearch && matchesClass
  })
)

function resetFilters() {
  search.value = ''
  selectedClass.value = 'All Classes'
  selectedType.value = 'All Types'
  selectedStatus.value = 'All Statuses'
}

function printAll() {
  info('Printing all ID cards is not available yet.')
}

function exportAll() {
  info('Bulk PDF export is not available yet.')
}

function printOne(student: { name: string }) {
  info(`Printing ${student.name}'s ID card is not available yet.`)
}

function exportOne(student: { name: string }) {
  info(`Exporting ${student.name}'s ID card is not available yet.`)
}

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>