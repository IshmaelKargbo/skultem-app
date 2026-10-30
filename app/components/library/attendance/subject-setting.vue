<script setup lang="ts">
// The school's Library subject: its timetable periods are the class library sessions Library Attendance takes a
// register for (docs/LIBRARY_ATTENDANCE.md D-7). There's no separate library timetable.
const store = useLibraryAttendanceStore()
const { success: toastSuccess, error: toastError } = useNotify()

const loading = ref(true)
const saving = ref(false)
const subjectId = ref<string | undefined>(undefined)
const saved = ref<string | null>(null)
const options = ref<{ label: string, value: string }[]>([])

async function load() {
  loading.value = true
  try {
    const [overview, subjects] = await Promise.all([
      LibraryAttendanceApi().overview(),
      LibraryAttendanceApi().subjects()
    ])
    options.value = subjects.map(s => ({ label: s.code ? `${s.name} (${s.code})` : s.name, value: s.id }))
    saved.value = overview.librarySubjectId
    subjectId.value = overview.librarySubjectId ?? undefined
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the Library subject')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await LibraryAttendanceApi().setLibrarySubject(subjectId.value ?? null)
    saved.value = subjectId.value ?? null
    toastSuccess(subjectId.value ? 'Library subject saved' : 'Library subject cleared')
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to save the Library subject')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <UIcon :name="LIBRARY_SESSION_ICON" class="size-5 text-primary" />
            <h3 class="font-semibold md:text-lg">Class Library Sessions</h3>
          </div>
          <p class="text-xs-base text-muted">
            Which subject on the timetable is the Library period. Its periods become the class sessions you take a
            register for.
          </p>
        </div>
        <UButton :icon="SAVE_ICON" label="Save" :loading="saving"
          :disabled="loading || (subjectId ?? null) === saved" @click="save" />
      </div>
    </template>

    <USkeleton v-if="loading" class="h-16 w-full rounded-2xl" />
    <div v-else class="space-y-3 rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
      <UFormField label="Library subject"
        description="Changing it only affects sessions that haven't been opened yet.">
        <USelectMenu v-model="subjectId" value-key="value" :items="options" placeholder="Choose a subject"
          :disabled="saving" class="w-full md:w-96" />
      </UFormField>
      <UButton v-if="subjectId" size="xs" variant="link" color="neutral" label="Clear" class="px-0"
        @click="() => { subjectId = undefined }" />
      <p class="text-xs text-muted">
        A Library period is added to the timetable like any other subject, with any teacher in the teacher slot.
        That teacher gets no access to library attendance - the librarian takes the register.
      </p>
    </div>
  </UCard>
</template>
