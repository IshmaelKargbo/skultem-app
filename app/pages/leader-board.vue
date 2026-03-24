<template>
  <div class="p-7 overflow-y-auto h-full space-y-5">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <p class="text-2xl font-semibold">Leader Board</p>
        <p class="text-mute">Create custom reports and explore your school data</p>
      </div>
    </div>
    <UCard>
      <div>
        <UTable :columns="columns" :data="data">
          <template #trend-cell="{ row }">
            <div class="flex justify-end">
              <UBadge variant="outline" :label="row.original.trend" :color="parseTrend[row.original.trend].color"
                :trailing-icon="parseTrend[row.original.trend].icon" />
            </div>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useReportStore()

const data = ref([
  {
    id: '1',
    rank: 1,
    student: 'Ishmael Kargbo',
    score: 800,
    weight: 90,
    grade: 'A',
    trend: 'Improved'
  },
  {
    id: '2',
    rank: 2,
    student: 'Fatmata Bangura',
    score: 780,
    weight: 88,
    grade: 'A',
    trend: 'Stable'
  },
  {
    id: '3',
    rank: 3,
    student: 'Mohamed Kamara',
    score: 760,
    weight: 85,
    grade: 'A',
    trend: 'Improved'
  },
  {
    id: '4',
    rank: 4,
    student: 'Hawa Conteh',
    score: 735,
    weight: 82,
    grade: 'B+',
    trend: 'Dropped'
  },
  {
    id: '5',
    rank: 5,
    student: 'Abdul Sesay',
    score: 720,
    weight: 80,
    grade: 'B+',
    trend: 'Stable'
  },
  {
    id: '6',
    rank: 6,
    student: 'Mariama Koroma',
    score: 705,
    weight: 78,
    grade: 'B',
    trend: 'Improved'
  },
  {
    id: '7',
    rank: 7,
    student: 'Alhaji Bah',
    score: 690,
    weight: 76,
    grade: 'B',
    trend: 'Dropped'
  },
  {
    id: '8',
    rank: 8,
    student: 'Kadiatu Turay',
    score: 675,
    weight: 74,
    grade: 'B',
    trend: 'Stable'
  },
  {
    id: '9',
    rank: 9,
    student: 'Sorie Jalloh',
    score: 660,
    weight: 72,
    grade: 'C+',
    trend: 'Improved'
  },
  {
    id: '10',
    rank: 10,
    student: 'Isatu Mansaray',
    score: 640,
    weight: 70,
    grade: 'C+',
    trend: 'Dropped'
  }
])
const { breakdown } = storeToRefs(store)

onMounted(() => {
  useAppStore().setTitle('Leader Board')
  document.title = 'Leader Board | Skultem'

  loadAvarageData()
})

const columns: TableColumn<Behaviour> = [
  {
    accessorKey: 'rank',
    header: 'Rank'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'score',
    header: 'Score'
  },
  {
    accessorKey: 'weight',
    header: 'Weighted'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'trend',
    header: ''
  }
]

async function loadAvarageData() {
  try {
    const payload = {
      entity: "breakdown",
      title: "Class Performance",
      filters: [
        {
          field: 'cycle.term.id',
          value: "TRM-2026-0001",
          operator: "EQUALS",
          type: "select"
        },
        {
          field: 'studentAssessment.enrollment.clazz.id',
          value: "CLS-2026-0001",
          operator: "EQUALS",
          type: "select"
        }
      ],
    }

    await store.runReport(payload, 0, 0)

  } catch (err) {
    console.error("Failed to load class performance", err)
  } finally {
    // avarageLoading.value = false
  }
}

definePageMeta({
  role: [Role.SCHOOL_ADMIN, Role.TEACHER]
})
</script>
