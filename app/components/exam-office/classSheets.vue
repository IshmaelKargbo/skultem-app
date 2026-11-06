<!-- One printed page per class: the notice-board / take-home copy of an exam timetable. Hidden on screen. -->
<template>
  <div class="hidden print:block">
    <section v-for="sheet in sheets" :key="sheet.classId" class="exam-sheet text-black">
      <header class="mb-4 flex items-center gap-3 border-b-2 border-black pb-3">
        <img v-if="school?.logo" :src="school.logo" alt="" class="size-14 object-contain">
        <div class="min-w-0 flex-1 text-center">
          <p class="text-lg font-bold uppercase">{{ school?.name }}</p>
          <p class="text-base font-semibold">{{ timetable.title }}</p>
          <p class="text-sm">{{ timetable.termName }}<template v-if="period"> · {{ period }}</template></p>
        </div>
        <div class="size-14" />
      </header>

      <p class="mb-2 text-base font-bold">Class: {{ sheet.className }}</p>

      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="border border-black px-2 py-1 text-left">Day</th>
            <th class="border border-black px-2 py-1 text-left">Time</th>
            <th class="border border-black px-2 py-1 text-left">Subject</th>
            <th class="border border-black px-2 py-1 text-left">Paper</th>
            <th class="border border-black px-2 py-1 text-left">Venue</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="day in sheet.days" :key="day.date">
            <tr v-for="(p, i) in day.papers" :key="p.id">
              <td v-if="i === 0" :rowspan="day.papers.length" class="border border-black px-2 py-1 align-top font-medium">
                {{ formatExamDay(day.date) }}
              </td>
              <td class="border border-black px-2 py-1 whitespace-nowrap">{{ examTime(p.startTime) }}–{{ examTime(p.endTime) }}</td>
              <td class="border border-black px-2 py-1">{{ p.subjectName }}</td>
              <td class="border border-black px-2 py-1">{{ p.paper ?? '' }}</td>
              <td class="border border-black px-2 py-1">{{ p.venue ?? '' }}</td>
            </tr>
          </template>
        </tbody>
      </table>

      <div v-if="timetable.instructions" class="mt-4 text-sm">
        <p class="font-bold">Instructions to candidates</p>
        <ul class="ml-5 list-disc">
          <li v-for="(line, i) in instructionLines" :key="i">{{ line }}</li>
        </ul>
      </div>

      <div class="mt-10 flex justify-between text-sm">
        <p>…………………………………<br>Exam Officer</p>
        <p class="text-right">…………………………………<br>Principal</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { timetable, classIds } = defineProps<{
  timetable: ExamTimetable
  // Which classes get a page; empty = every class that has a paper.
  classIds?: string[]
}>()

const { school, hydrateFromCache } = useSchoolInfo()
hydrateFromCache()

const period = computed(() => timetable.startDate && timetable.endDate
  ? `${formatDate(timetable.startDate)} – ${formatDate(timetable.endDate)}`
  : '')

const instructionLines = computed(() => (timetable.instructions ?? '').split('\n').map(l => l.trim()).filter(Boolean))

const sheets = computed(() => {
  const wanted = classIds?.length ? classIds : timetable.classes.map(c => c.id)
  return timetable.classes
    .filter(c => wanted.includes(c.id))
    .map(c => ({
      classId: c.id,
      className: c.name,
      days: groupPapersByDay(timetable.papers.filter(p => p.classes.some(pc => pc.id === c.id))),
    }))
    .filter(s => s.days.length)
})
</script>

<style scoped>
@media print {
  .exam-sheet {
    page-break-after: always;
    break-after: page;
  }
  .exam-sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
}
</style>
