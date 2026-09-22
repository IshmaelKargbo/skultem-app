<script setup lang="ts">
const props = defineProps<{
  classOptions: { label: string; value: string }[]
  activeCount: number
}>()

const classSessionId = defineModel<string>('classSessionId', { required: true })
const studentId = defineModel<string>('studentId', { required: true })
const method = defineModel<string>('method', { required: true })

const methodOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank', value: 'BANK' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
]

const { searchTerm: studentSearchTerm, students: studentOptions, loading: studentsLoading } = useStudentSearch()

const open = ref(false)
const draftClassSessionId = ref(classSessionId.value)
const draftStudentId = ref(studentId.value)
const draftMethod = ref(method.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftClassSessionId.value = classSessionId.value
  draftStudentId.value = studentId.value
  draftMethod.value = method.value
})

const draftIsDefault = computed(() => !draftClassSessionId.value && !draftStudentId.value && !draftMethod.value)

function clearDraft() {
  draftClassSessionId.value = ''
  draftStudentId.value = ''
  draftMethod.value = ''
}

function apply() {
  classSessionId.value = draftClassSessionId.value
  studentId.value = draftStudentId.value
  method.value = draftMethod.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter payment history"
    description="Narrow by class, student or payment method">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 md:flex-row">
        <UFormField label="Class" class="md:flex-1">
          <USelectMenu v-model="draftClassSessionId" value-key="value" label-key="label" :items="classOptions"
            placeholder="Every class" clear class="w-full" />
        </UFormField>
        <UFormField label="Student" class="md:flex-1">
          <USelectMenu v-model="draftStudentId" v-model:search-term="studentSearchTerm" :items="studentOptions"
            :loading="studentsLoading" ignore-filter value-key="value" label-key="label" placeholder="Every student"
            clear class="w-full" />
        </UFormField>
        <UFormField label="Payment Method" class="md:flex-1">
          <USelectMenu v-model="draftMethod" value-key="value" label-key="label" :items="methodOptions"
            placeholder="Every method" clear class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="grid grid-cols-2 gap-2 w-full md:flex md:justify-end border-t pt-3 border-default">
        <UButton :icon="DELETE_ICON" class="justify-center md:min-w-32" variant="outline" color="error" label="Clear"
          :disabled="draftIsDefault" @click="clearDraft" />
        <UButton color="primary" label="Apply" class="justify-center md:min-w-32" @click="apply" />
      </div>
    </template>
  </UDrawer>
</template>
