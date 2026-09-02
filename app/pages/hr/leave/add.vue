<template>
  <div class=" space-y-4 px-4 md:px-6">

    <Heading title="New Leave Request"
      :subtitle="isAdmin ? 'Submit a leave request on behalf of a teacher.' : 'Submit a new leave request.'" />

    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-4" @submit="onSubmit">

      <!-- Teacher - admin only, teachers file for themselves -->
      <UCard v-if="isAdmin">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="text-primary" />
            <span class="font-semibold">Teacher</span>
          </div>
        </template>

        <UFormField label="Select Teacher" name="teacherId" required>
          <USelectMenu v-model="state.teacherId" :items="teacherOptions" :loading="loadingTeachers"
            value-key="value" label-key="label" icon="i-lucide-search" placeholder="Search teachers…" class="w-full" />
        </UFormField>
      </UCard>

      <!-- Leave Details -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar-days" class="text-primary" />
            <span class="font-semibold">
              Leave Details
            </span>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">

          <UFormField label="Leave Type" name="type" required class="md:col-span-2">
            <USelectMenu v-model="state.type" :items="LEAVE_TYPE_OPTIONS" value-key="value" label-key="label"
              placeholder="Select type" class="w-full" />
          </UFormField>

          <UFormField label="Start Date" name="startDate" required>
            <UInput v-model="state.startDate" type="date" class="w-full" />
          </UFormField>

          <UFormField label="End Date" name="endDate" required>
            <UInput v-model="state.endDate" type="date" class="w-full" />
          </UFormField>

        </div>

        <p v-if="durationDays" class="mt-3 flex items-center gap-1.5 text-sm text-muted">
          <UIcon name="i-lucide-info" class="size-4" />
          {{ durationDays }} day{{ durationDays === 1 ? '' : 's' }} of leave.
        </p>
      </UCard>

      <!-- Reason -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="text-primary" />
            <span class="font-semibold">
              Reason for Leave
            </span>
          </div>
        </template>

        <UFormField name="reason">
          <UTextarea v-model="state.reason" :rows="5" class="w-full"
            placeholder="Provide details about the leave request..." />
        </UFormField>
      </UCard>

      <!-- Buttons -->
      <div class="flex justify-end gap-3">
        <UButton variant="soft" color="neutral" to="/hr/leave" label="Cancel" />
        <UButton type="submit" icon="i-lucide-send" :loading="saving" label="Submit Request" />
      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const router = useRouter()
const notify = useNotify()
const store = useLeaveStore()

const teacherStore = useTeacherStore()
const { records: teachers } = storeToRefs(teacherStore)
const loadingTeachers = ref(false)

const formRef = ref()
const saving = ref(false)

const state = reactive({
  teacherId: '',
  type: undefined as LeaveType | undefined,
  startDate: '',
  endDate: '',
  reason: ''
})

const schema = computed(() => yup.object({
  teacherId: isAdmin.value ? yup.string().required('Teacher is required') : yup.string().notRequired(),
  type: yup.string().required('Leave type is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required')
    .test('after-start', 'End date must be on or after the start date', function (value) {
      if (!value || !this.parent.startDate) return true
      return new Date(value) >= new Date(this.parent.startDate)
    }),
  reason: yup.string().trim().required('Reason is required'),
}))

const teacherOptions = computed(() => teachers.value.map(t => ({
  label: `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim(),
  value: t.id
})))

const durationDays = computed(() => {
  if (!state.startDate || !state.endDate) return 0
  const start = new Date(state.startDate)
  const end = new Date(state.endDate)
  if (end < start) return 0
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  saving.value = true
  try {
    const payload = { type: state.type!, startDate: state.startDate, endDate: state.endDate, reason: state.reason }

    const result = isAdmin.value
      ? await store.create({ ...payload, teacherId: state.teacherId })
      : await store.createForMe(payload)

    notify.success('Leave request submitted.')
    await router.push(`/hr/leave/${result.id}`)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to submit leave request.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('New Leave Request')
  useAppStore().setBack('/hr/leave')
  document.title = 'New Leave Request | Skultem'

  if (isAdmin.value) {
    loadingTeachers.value = true
    try {
      await teacherStore.fetchAll(1, 0)
    } finally {
      loadingTeachers.value = false
    }
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
