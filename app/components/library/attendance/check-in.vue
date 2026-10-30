<script setup lang="ts">
// Checks one or more students in to the library. All or nothing: if anyone selected can't be checked in, nobody
// is, and the reasons are shown. The librarian can then choose to check in the eligible students only - a
// separate, deliberate step (docs/LIBRARY_ATTENDANCE.md AR-5, D-5).
const store = useLibraryAttendanceStore()
const { success: toastSuccess, error: toastError, warning: toastWarning } = useNotify()

const open = ref(false)
const saving = ref(false)
const selected = ref<string[]>([])
const refused = ref<CheckInRefusal[]>([])

const { searchTerm, students, loading } = useStudentSearch(25, () => selected.value)

const eligibleCount = computed(() => selected.value.length - refused.value.length)

// Picking someone else after a refusal means the old reasons no longer describe the selection.
watch(selected, () => { refused.value = [] })

function close() {
  open.value = false
  selected.value = []
  refused.value = []
  searchTerm.value = ''
}

async function checkIn(eligibleOnly: boolean) {
  if (!selected.value.length) return
  saving.value = true
  try {
    const res = await LibraryAttendanceApi().checkIn(selected.value, eligibleOnly, crypto.randomUUID())
    if (!res.checkedIn.length) {
      refused.value = res.refused
      return
    }
    const n = res.checkedIn.length
    toastSuccess(n === 1 ? `${res.checkedIn[0]!.studentName} checked in` : `${n} students checked in`)
    for (const w of res.warnings || []) toastWarning(`${w.studentName}: ${w.reason}`)
    store.changed()
    close()
  } catch (err: any) {
    toastError(err?.message || 'Failed to check in')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <USlideover :dismissible="false" v-model:open="open">
    <UButton color="primary" label="Check In" :icon="CHECK_IN_ICON" @click="() => { open = true }" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <div>
          <p class="text-lg font-semibold">Check In to the Library</p>
          <p class="text-sm text-muted">For students visiting outside a class library period.</p>
        </div>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <div class="space-y-5">
        <UFormField label="Students" description="Search by name. Pick as many as are coming in together." required>
          <USelectMenu v-model="selected" v-model:search-term="searchTerm" multiple value-key="value"
            :items="students" :loading="loading" ignore-filter placeholder="Search for students"
            :disabled="saving" class="w-full" />
        </UFormField>

        <div v-if="refused.length" class="space-y-3">
          <UAlert color="error" variant="soft" icon="i-lucide-ban" title="Nobody was checked in"
            :description="refused.length === 1
              ? 'One student can\'t be checked in right now:'
              : `${refused.length} students can't be checked in right now:`" />

          <ul class="divide-y divide-default rounded-xl border border-default">
            <li v-for="r in refused" :key="r.studentId" class="px-4 py-2.5">
              <p class="text-sm font-medium">{{ r.studentName || 'Unknown student' }}</p>
              <p class="text-xs text-muted">{{ r.reason }}</p>
            </li>
          </ul>

          <p v-if="eligibleCount > 0" class="text-sm text-muted">
            You can remove them from the list, or check in the other {{ eligibleCount }}
            {{ eligibleCount === 1 ? 'student' : 'students' }} only.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-wrap gap-3">
        <UButton v-if="refused.length && eligibleCount > 0" :icon="CHECK_IN_ICON" color="warning" :loading="saving"
          :label="`Check In Eligible Only (${eligibleCount})`" @click="checkIn(true)" />
        <UButton v-else :icon="CHECK_IN_ICON" :loading="saving" :disabled="!selected.length"
          :label="selected.length > 1 ? `Check In ${selected.length} Students` : 'Check In'" @click="checkIn(false)" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
