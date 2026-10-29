<script setup lang="ts">
import * as yup from 'yup'

const store = useLibraryStore()
const { success: toastSuccess, error: toastError } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

// Earliest allowed due date - a book is always lent for at least one day.
function tomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

// Starts from the school's loan period (Library Settings), 14 days until that has loaded.
function defaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + (store.settings?.defaultLoanDays ?? 14))
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

function defaultState() {
  return {
    bookId: '',
    borrowerType: 'STUDENT' as BorrowerType,
    borrowerId: '',
    dueDate: defaultDueDate()
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  bookId: yup.string().required('Select a book'),
  borrowerType: yup.string().required(),
  borrowerId: yup.string().required('Select a borrower'),
  dueDate: yup.string().required('Due date is required')
    .test('after-today', 'Due date must be tomorrow or later', v => !v || v >= tomorrow())
})

// Every search replaces its list, so remember labels of what's been seen - a picked option then
// keeps its name in the field even after the search moves on.
type Option = { label: string, value: string, disabled?: boolean }

function keepSelected(found: Option[], selectedId: string, labels: Record<string, string>) {
  if (!selectedId || found.some(o => o.value === selectedId) || !labels[selectedId]) return found
  return [{ label: labels[selectedId]!, value: selectedId }, ...found]
}

function debounced(fn: (term: string) => void) {
  let timer: ReturnType<typeof setTimeout>
  return (term: string) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(term), 300)
  }
}

// Books
const bookSearch = ref('')
const bookResults = ref<Book[]>([])
const booksLoading = ref(false)
const bookLabels = reactive<Record<string, string>>({})

async function searchBooks(term: string) {
  booksLoading.value = true
  try {
    bookResults.value = await store.searchBooks(term)
    for (const b of bookResults.value) bookLabels[b.id] = b.title
  } catch {
    bookResults.value = []
  } finally {
    booksLoading.value = false
  }
}

const bookOptions = computed(() => keepSelected(
  bookResults.value.map(b => ({
    label: b.availableCopies > 0 ? `${b.title} · ${b.availableCopies} available` : `${b.title} · none available`,
    value: b.id,
    disabled: b.availableCopies < 1
  })),
  state.bookId,
  bookLabels
))

watch(bookSearch, debounced(searchBooks))

// Students
const { searchTerm: studentSearch, students, loading: studentsLoading } = useStudentSearch(25, () => [state.borrowerId])

// Teachers
const teacherSearch = ref('')
const teacherResults = ref<Teacher[]>([])
const teachersLoading = ref(false)
const teacherLabels = reactive<Record<string, string>>({})

function teacherName(t: Teacher) {
  return [t.user?.givenNames, t.user?.familyName].filter(Boolean).join(' ')
}

async function searchTeachers(term: string) {
  teachersLoading.value = true
  try {
    const res = await TeacherApi().getAll(term, 1, 25) as any
    teacherResults.value = res?.data || []
    for (const t of teacherResults.value) teacherLabels[t.id] = teacherName(t)
  } catch {
    teacherResults.value = []
  } finally {
    teachersLoading.value = false
  }
}

const teacherOptions = computed(() => keepSelected(
  teacherResults.value.map(t => ({ label: teacherName(t), value: t.id })),
  state.borrowerId,
  teacherLabels
))

watch(teacherSearch, debounced(searchTeachers))

// The borrowing rules for whoever is picked - the same check the backend runs when issuing.
const borrowerStatus = ref<BorrowerStatus | null>(null)
const statusLoading = ref(false)
let statusRequest = 0

watch(() => [state.borrowerType, state.borrowerId] as const, async ([type, id]) => {
  borrowerStatus.value = null
  if (!id) return

  const request = ++statusRequest
  statusLoading.value = true
  try {
    const status = await LibraryApi().borrowerStatus(type, id)
    if (request === statusRequest) borrowerStatus.value = status
  } catch {
    // Not fatal - the backend still enforces the rules when the book is issued.
  } finally {
    if (request === statusRequest) statusLoading.value = false
  }
})

const blocked = computed(() => borrowerStatus.value?.canBorrow === false)

watch(() => state.borrowerType, (type) => {
  state.borrowerId = ''
  if (type === 'TEACHER' && !teacherResults.value.length) searchTeachers('')
})

watch(open, async (isOpen) => {
  if (!isOpen) return
  if (!bookResults.value.length) searchBooks('')
  if (!store.settings) {
    try {
      await store.fetchSettings()
      state.dueDate = defaultDueDate()
    } catch {
      // Keep the 14-day default.
    }
  }
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  if (blocked.value) return
  isLoading.value = true

  try {
    await store.issueBook({ ...state })
    toastSuccess('Book issued successfully')
    close()
    // Copies changed - refresh the picker so the next issue sees the new counts.
    searchBooks(bookSearch.value)
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover :dismissible="false" v-model:open="open">
    <UButton color="primary" label="Issue Book" :icon="ISSUE_BOOK_ICON" @click="open = true" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">Issue Book</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Book" name="bookId" required>
          <USelectMenu v-model="state.bookId" v-model:search-term="bookSearch" value-key="value"
            :items="bookOptions" :loading="booksLoading" ignore-filter placeholder="Search for a book"
            :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Borrower Type" name="borrowerType" required>
          <USelectMenu v-model="state.borrowerType" value-key="value" :items="borrowerTypes" :search-input="false"
            :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField v-if="state.borrowerType === 'STUDENT'" label="Student" name="borrowerId" required>
          <USelectMenu v-model="state.borrowerId" v-model:search-term="studentSearch" value-key="value"
            :items="students" :loading="studentsLoading" ignore-filter placeholder="Search for a student"
            :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField v-else label="Teacher" name="borrowerId" required>
          <USelectMenu v-model="state.borrowerId" v-model:search-term="teacherSearch" value-key="value"
            :items="teacherOptions" :loading="teachersLoading" ignore-filter placeholder="Search for a teacher"
            :disabled="isLoading" class="w-full" />
        </UFormField>

        <!-- Borrower status -->
        <div v-if="state.borrowerId">
          <USkeleton v-if="statusLoading" class="h-14 w-full rounded-xl" />

          <UAlert v-else-if="borrowerStatus && blocked" color="error" variant="soft" icon="i-lucide-ban"
            title="Can't borrow right now" :description="borrowerStatus.reason ?? undefined" />

          <UAlert v-else-if="borrowerStatus" color="neutral" variant="soft" icon="i-lucide-book-check"
            :title="`Holding ${borrowerStatus.activeLoans} of ${borrowerStatus.maxLoans} books allowed`"
            :description="borrowerStatus.overdueLoans
              ? `${borrowerStatus.overdueLoans} overdue - borrowing isn't blocked for overdue books at this school.`
              : undefined" />
        </div>

        <UFormField label="Due Date" name="dueDate" required>
          <UInput v-model="state.dueDate" type="date" :min="tomorrow()" :disabled="isLoading" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" :disabled="blocked || statusLoading" label="Issue Book" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
