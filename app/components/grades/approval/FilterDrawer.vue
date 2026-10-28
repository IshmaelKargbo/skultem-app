<script setup lang="ts">
type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

type Option = { label: string; value: string }

// Same look and behaviour as the Classes page filter (ClassFilterDrawer): picks are held as a
// draft and only applied on "Apply". The teacher field shows only when teacherOptions is passed.
const props = defineProps<{
  classOptions: Option[]
  teacherOptions?: Option[]
  loadingClasses?: boolean
  loadingTeachers?: boolean
  activeCount: number
}>()

const status = defineModel<ApprovalRequestStatusFilter>('status', { required: true })
const classId = defineModel<string>('classId', { required: true })
const teacherId = defineModel<string>('teacherId', { default: '' })

const statusOptions: { label: string, value: ApprovalRequestStatusFilter }[] = [
  { label: 'Pending', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Returned', value: 'RETURNED' }
]

const showTeacher = computed(() => !!props.teacherOptions)

const open = ref(false)
const draftStatus = ref(status.value)
const draftClassId = ref(classId.value)
const draftTeacherId = ref(teacherId.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftStatus.value = status.value
  draftClassId.value = classId.value
  draftTeacherId.value = teacherId.value
})

const draftIsDefault = computed(() => !draftStatus.value && !draftClassId.value && !draftTeacherId.value)

function clearDraft() {
  draftStatus.value = ''
  draftClassId.value = ''
  draftTeacherId.value = ''
}

function apply() {
  status.value = draftStatus.value ?? ''
  classId.value = draftClassId.value ?? ''
  teacherId.value = draftTeacherId.value ?? ''
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter approval requests"
    :description="showTeacher ? 'Narrow the list by class, teacher or status' : 'Narrow the list by class or status'">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="() => { open = false }" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 md:flex-row">
        <UFormField label="Class" class="md:flex-1">
          <USelectMenu v-model="draftClassId" value-key="value" label-key="label" :items="classOptions"
            :loading="loadingClasses" placeholder="All Classes" clear class="w-full" />
        </UFormField>
        <UFormField v-if="showTeacher" label="Teacher" class="md:flex-1">
          <USelectMenu v-model="draftTeacherId" value-key="value" label-key="label" :items="teacherOptions"
            :loading="loadingTeachers" placeholder="All Teachers" clear class="w-full" />
        </UFormField>
        <UFormField label="Status" class="md:flex-1">
          <USelectMenu v-model="draftStatus" value-key="value" label-key="label" :items="statusOptions"
            placeholder="All Statuses" clear class="w-full" />
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
