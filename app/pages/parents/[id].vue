<template>
  <div class="px-4 md:px-6 space-y-3">
    <!-- Profile -->
    <UCard>
      <div v-if="loading" class="flex flex-col items-center gap-4 md:flex-row">
        <USkeleton class="size-20 rounded-2xl" />
        <div class="flex-1 space-y-2">
          <USkeleton class="mx-auto h-6 w-48 md:mx-0" />
          <USkeleton class="mx-auto h-4 w-64 md:mx-0" />
        </div>
        <USkeleton class="h-9 w-28 rounded-md" />
      </div>

      <div v-else-if="parent" class="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div class="flex min-w-0 flex-col items-center gap-4 md:flex-row">
          <UAvatar :alt="parent.name" class="size-20 rounded-2xl text-2xl" />
          <div class="min-w-0 text-center md:text-left">
            <h1 class="truncate text-xl font-bold text-highlighted">{{ parent.name }}</h1>
            <div class="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <UBadge :label="STATUS_LABELS[parent.status] || parent.status" :color="STATUS_COLORS[parent.status] || 'neutral'"
                variant="subtle" size="sm" />
              <UBadge v-if="!parent.email" label="No Email" color="warning" variant="subtle" size="sm" />
              <span class="text-sm text-muted">
                {{ parent.students }} student{{ parent.students === 1 ? '' : 's' }}
              </span>
            </div>
          </div>
        </div>

        <UDropdownMenu v-if="actionItems.length" :items="actionItems" :content="{ align: 'end' }">
          <UButton label="Actions" trailing-icon="i-lucide-settings-2" color="neutral"
            variant="outline" class="w-full justify-center md:w-auto" />
        </UDropdownMenu>
      </div>

      <div v-else-if="loadError" class="flex flex-col items-center gap-2 py-10 text-center">
        <p class="text-sm text-error">Couldn't load this parent: {{ loadError }}</p>
        <UButton variant="soft" size="sm" label="Try again" @click="load(); loadStudents()" />
      </div>
      <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
        <UIcon name="i-lucide-user-x" class="text-4xl text-muted" />
        <p class="font-medium">Parent not found</p>
        <UButton variant="soft" label="Back to parents" to="/parents" />
      </div>
    </UCard>

    <div v-if="loading || parent" class="grid gap-3 lg:grid-cols-3">
      <!-- Details -->
      <UCard>
        <template #header>
          <p class="font-semibold">Contact details</p>
        </template>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="space-y-1.5">
            <USkeleton class="h-3 w-16" />
            <USkeleton class="h-4 w-40" />
          </div>
        </div>

        <dl v-else-if="parent" class="space-y-4 text-sm">
          <div v-for="item in details" :key="item.label" class="flex items-start gap-3">
            <UIcon :name="item.icon" class="mt-0.5 size-4 shrink-0 text-muted" />
            <div class="min-w-0">
              <dt class="text-xs text-muted">{{ item.label }}</dt>
              <dd class="break-words text-highlighted">{{ item.value || '—' }}</dd>
            </div>
          </div>
        </dl>
      </UCard>

      <!-- Children -->
      <UCard class="lg:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-semibold">Children</p>
            <!-- What the family owes this year, all children together -->
            <div v-if="canSeeAmounts && students.length" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span class="text-muted">Fees <b class="text-highlighted">{{ format(family.owed) }}</b></span>
              <span class="text-muted">Paid <b class="text-success">{{ format(family.paid) }}</b></span>
              <span class="text-muted">Balance <b :class="family.balance > 0 ? 'text-error' : 'text-success'">{{ format(family.balance) }}</b></span>
            </div>
          </div>
        </template>

        <div v-if="loadingStudents" class="divide-y divide-default">
          <div v-for="i in 2" :key="i" class="flex items-center gap-3 p-4">
            <USkeleton class="size-10 rounded-full" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-28" />
            </div>
          </div>
        </div>

        <div v-else-if="students.length" class="divide-y divide-default">
          <NuxtLink v-for="s in students" :key="s.id" :to="`/students/${s.id}?back=/parents/${id}`"
            class="flex items-center gap-3 p-4 transition-colors hover:bg-elevated/50">
            <UAvatar :src="s.photo || undefined" :alt="`${s.givenNames} ${s.familyName}`" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-highlighted">{{ s.givenNames }} {{ s.familyName }}</p>
              <p class="truncate text-xs text-muted">
                {{ s.admissionNumber || 'No admission number' }}<template v-if="s.className && s.className !== 'N/A'"> · {{ s.className }}</template>
              </p>
            </div>
            <UBadge v-if="hasLeft(s)" size="sm" variant="subtle" :color="s.status === 'EXPELLED' ? 'error' : 'warning'"
              :label="s.status === 'EXPELLED' ? 'Expelled' : 'Withdrawn'" class="shrink-0" />
            <div v-if="s.feeDetail" class="shrink-0 text-right">
              <p v-if="canSeeAmounts" class="text-sm font-semibold"
                :class="Number(s.feeDetail.balance) > 0 ? 'text-error' : 'text-success'">
                {{ Number(s.feeDetail.balance) > 0 ? `${format(s.feeDetail.balance)} owed` : 'Paid up' }}
              </p>
              <UBadge v-else size="sm" variant="subtle" :color="parseFeeStatusColor[s.feeDetail.status] || 'neutral'"
                :label="s.feeDetail.status" />
            </div>
            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-muted" />
          </NuxtLink>
        </div>

        <div v-else-if="studentsError" class="flex flex-col items-center gap-2 py-10 text-center">
          <p class="text-sm text-error">Couldn't load the children: {{ studentsError }}</p>
          <UButton variant="soft" size="xs" label="Try again" @click="loadStudents" />
        </div>
        <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
          <UIcon name="i-lucide-users" class="text-4xl text-muted" />
          <p class="text-sm text-muted">No children linked to this guardian.</p>
        </div>
      </UCard>
    </div>

    <ParentEdit v-if="parent && editOpen" v-model:open="editOpen" :parent="parent" @saved="load" />

    <ParentDeletePermanently v-if="parent && deleteOpen" v-model:open="deleteOpen" :parent="parent"
      @deleted="navigateTo('/parents')" />

    <!-- Reload once it closes so the "No Email" badge and the actions reflect the new email -->
    <ParentAddEmail v-if="parent && addEmailOpen" :open="addEmailOpen" :parent-id="parent.id" :parent-name="parent.name"
      @update:open="(v) => { addEmailOpen = v; if (!v) load() }" />

    <AuthUsersResetPasswordPrompt v-if="parent && loginOpen" v-model:open="loginOpen" :user-id="parent.userId"
      :user-name="parent.name" :sign-in-with="parent.phone" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)
const { can } = useAuth()
// Permanent delete is owner-level only, like the backend.
const canDelete = computed(() => can([Role.PROPRIETOR, Role.OWNER]))

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Active', INACTIVE: 'Inactive', DELETED: 'Deleted' }
const STATUS_COLORS: Record<string, any> = { ACTIVE: 'success', INACTIVE: 'warning', DELETED: 'error' }

const parent = ref<Parent | null>(null)
const students = ref<Student[]>([])
const loading = ref(true)
const loadingStudents = ref(true)
// Why a load failed - shown instead of "Parent not found" / "No children" when it was really an error.
const loadError = ref('')
const studentsError = ref('')

// Only the owner and principal see what is paid or owed (same as the student list); others see the status.
const canSeeAmounts = computed(() => can([Role.OWNER, Role.PRINCIPAL]))
const { format } = useMoney()
const hasLeft = (s: Student) => s.status === 'WITHDRAWN' || s.status === 'EXPELLED'
const family = computed(() => {
  const sum = (pick: (s: Student) => number) => students.value.reduce((t, s) => t + (Number(pick(s)) || 0), 0)
  return {
    owed: sum(s => s.feeDetail?.total ?? 0),
    paid: sum(s => s.feeDetail?.paid ?? 0),
    balance: sum(s => s.feeDetail?.balance ?? 0)
  }
})

const editOpen = ref(false)
const deleteOpen = ref(false)
const addEmailOpen = ref(false)
const loginOpen = ref(false)

// Every action that used to sit on the parents list row, in one menu.
const actionItems = computed(() => {
  if (!parent.value) return []
  const groups: any[][] = [[
    { label: 'Edit guardian', icon: EDIT_ICON, onSelect: () => { editOpen.value = true } },
    ...(!parent.value.email ? [{ label: 'Add email', icon: EMAIL_ICON, onSelect: () => { addEmailOpen.value = true } }] : []),
    { label: 'Give login', icon: 'i-lucide-key-round', onSelect: () => { loginOpen.value = true } }
  ]]
  if (canDelete.value) {
    groups.push([{ label: 'Delete permanently', icon: 'lucide:trash-2', color: 'error', onSelect: () => { deleteOpen.value = true } }])
  }
  return groups
})

const details = computed(() => [
  { label: 'Phone', value: parent.value?.phone, icon: 'i-lucide-phone' },
  { label: 'Email', value: parent.value?.email, icon: 'i-lucide-mail' },
  { label: 'Address', value: [parent.value?.street, parent.value?.city].filter(Boolean).join(', '), icon: 'i-lucide-map-pin' },
  { label: 'Added', value: parent.value?.createdAt ? formatDate(parent.value.createdAt) : '', icon: 'i-lucide-calendar' }
])

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    parent.value = await ParentApi().getOne(id.value) ?? null
    if (parent.value) {
      useAppStore().setTitle(parent.value.name)
      document.title = `${parent.value.name} | Parents | Skultem`
    }
  } catch (err: any) {
    parent.value = null
    loadError.value = err?.message || 'Could not load this parent'
  } finally {
    loading.value = false
  }
}

async function loadStudents() {
  loadingStudents.value = true
  studentsError.value = ''
  try {
    students.value = await ParentApi().getStudentsOf(id.value) ?? []
  } catch (err: any) {
    students.value = []
    studentsError.value = err?.message || 'Could not load the children'
  } finally {
    loadingStudents.value = false
  }
}

watch(id, () => { load(); loadStudents() }, { immediate: true })

onMounted(() => {
  useAppStore().setTitle('Parent')
  useAppStore().setBack((route.query.back as string) || '/parents')
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
