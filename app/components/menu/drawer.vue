<script setup lang="ts">
import { ref, computed, watch } from "vue"

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const { activeRole, can, setActiveRole } = useAuth()
const { canInstall, install } = usePwaInstall()

const router = useRouter()
const open = ref(false)

const name = computed(() =>
  user.value ? `${user.value.givenNames} ${user.value.familyName}` : ""
)

const roleDesc: Record<string, string> = {
  PROPRIETOR: 'School owner & oversight',
  ADMIN: 'Full system access',
  TEACHER: 'Classes & students',
  PARENT: 'Child progress',
  ACCOUNTANT: 'Finance & fees',
}

const roleIcons: Record<string, string> = {
  PROPRIETOR: 'lucide:crown',
  ADMIN: 'lucide:shield',
  TEACHER: 'lucide:book-open',
  PARENT: 'lucide:users',
  ACCOUNTANT: 'lucide:calculator',
}

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((role: string) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
    desc: roleDesc[role] ?? "Access level",
    icon: roleIcons[role] ?? "lucide:user"
  }))
)

function close() {
  open.value = false
}

function switchRole(role: string) {
  setActiveRole(role)
  close()
}

async function installApp() {
  const installed = await install()
  if (installed) {
    close()
  }
}

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    open.value = false
  }
)
</script>

<template>
  <USlideover :open="open" :dismissible="false" :ui="{ content: 'w-screen max-w-none' }" @update:open="open = $event">
    <!-- Trigger -->
    <UButton class="md:hidden" color="neutral" variant="link" icon="lucide:menu" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-3">
          <div class="relative shrink-0">
            <UAvatar :alt="name" size="md" />
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-500 rounded-full" />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">
              {{ name }}
            </p>

            <span class="text-xs text-gray-500">
              Active as
              <strong class="text-primary capitalize">
                {{ clean(activeRole) }}
              </strong>
            </span>
          </div>
        </div>

        <UButton icon="lucide:x" color="neutral" variant="ghost" size="xs" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <div class="flex flex-col">
        <!-- Switch Role -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 pb-1">
            Switch Role
          </p>

          <div class="space-y-1 border-y py-2 border-gray-100">
            <button v-for="role in userRoles" :key="role.value"
              class="flex items-center gap-3 w-full px-3 py-2 rounded-xl border transition text-left" :class="activeRole === role.value
                ? 'bg-primary-50 border-primary-200'
                : 'border-transparent hover:bg-gray-50'
                " @click="switchRole(role.value)">
              <span class="w-7 h-7 flex items-center justify-center rounded-lg" :class="activeRole === role.value
                ? 'bg-primary-100'
                : 'bg-gray-100'
                ">
                <UIcon :name="role.icon" class="text-sm" />
              </span>

              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold">
                  {{ clean(role.label) }}
                </p>

                <p class="text-xs text-gray-400 truncate">
                  {{ role.desc }}
                </p>
              </div>

              <UIcon v-if="activeRole === role.value" name="lucide:check" class="text-primary text-xs" />
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="border-b border-gray-100 py-2 space-y-0.5">
          <UButton v-if="can(['admin', 'proprietor'])" icon="lucide:settings" variant="ghost"
            class="w-full justify-start" to="/settings" @click="close">
            Settings
          </UButton>

          <UButton :icon="BELL_ICON" variant="ghost" class="w-full justify-start" to="/notifications" @click="close">
            Notifications
          </UButton>

          <UButton v-if="canInstall" icon="lucide:download" variant="ghost" class="w-full justify-start"
            @click="installApp">
            Install App
          </UButton>
        </div>

        <!-- Navigation -->
        <div class="border-b border-gray-100 py-2 space-y-0.5">
          <!-- Grades -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="GRADES_ICON" variant="ghost"
            class="w-full justify-start" to="/grades" @click="close">
            Grades
          </UButton>
          <!-- Grade Approval -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER])" :icon="GRADES_APPROVAL_ICON" variant="ghost"
            class="w-full justify-start" to="/grades/approval" @click="close">
            Grade Approval
          </UButton>
          <!-- Attendance -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="ATTENDANCE_ICON" variant="ghost"
            class="w-full justify-start" to="/attendance" @click="close">
            Attendance
          </UButton>
          <!-- Performance -->
          <UButton v-if="can([Role.PARENT])" :icon="PERFORMANCE_ICON" variant="ghost" class="w-full justify-start"
            to="/performance" @click="close">
            Performance
          </UButton>
          <!-- Behaviours -->
          <UButton v-if="can([Role.TEACHER, Role.PROPRIETOR])" :icon="BEHAVIOUR_ICON" variant="ghost"
            class="w-full justify-start" to="/behaviours" @click="close">
            Behaviours
          </UButton>
          <!-- Parents -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="PARENT_ICON" variant="ghost"
            class="w-full justify-start" to="/parents" @click="close">
            Parents
          </UButton>
          <!-- Subjects -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="SUBJECT_ICON" variant="ghost"
            class="w-full justify-start" to="/subjects" @click="close">
            Subjects
          </UButton>
        </div>
        <!-- Finance -->
        <div class="border-b border-gray-100 py-2 space-y-0.5">
          <!-- Fee Structures -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="FEE_STRUCTURE_ICON" variant="ghost"
            class="w-full justify-start" to="/fees-structures" @click="close">
            Fee Structures
          </UButton>
          <!-- Student Fees -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="STUDENT_FEES_ICON" variant="ghost"
            class="w-full justify-start" to="/student-fees" @click="close">
            Student Fees
          </UButton>
          <!-- Discounts -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="DISCOUNT_ICON" variant="ghost"
            class="w-full justify-start" to="/discounts" @click="close">
            Discounts
          </UButton>
          <!-- Expenses -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="EXPENSES_ICON" variant="ghost"
            class="w-full justify-start" to="/expenses" @click="close">
            Expenses
          </UButton>
          <!-- Ledger -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="LEDGER_ICON" variant="ghost"
            class="w-full justify-start" to="/ledger" @click="close">
            Ledger
          </UButton>
          <!-- Transactions -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="TRANSACTION_ICON" variant="ghost"
            class="w-full justify-start" to="/transactions" @click="close">
            Transactions
          </UButton>
          <!-- Analytics -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="ANALYTICS_ICON" variant="ghost"
            class="w-full justify-start" to="/analytics" @click="close">
            Analytics
          </UButton>
        </div>
        <!-- Finance -->
        <div class="border-b border-gray-100 py-2 space-y-0.5">
          <!-- curriculums -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="CURRICULUM_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums" @click="close">
            Curriculums
          </UButton>
          <!-- Subject Groups -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="CURRICULUM_GROUP_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums/subject-groups" @click="close">
            Subject Groups
          </UButton>
          <!-- Class subjects -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="BOOK_OPEN_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums/class-subjects" @click="close">
            Class Subjects
          </UButton>
          <!-- Teacher Assignment -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="CLIPBOARD_ADD_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums/teacher-assignment" @click="close">
            Teacher Assignment
          </UButton>
          <!-- Sections -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="LAYERS_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums/sections" @click="close">
            Sections
          </UButton>
          <!-- Streams -->
          <UButton v-if="can([Role.PROPRIETOR, Role.ADMIN])" :icon="CURRICULUM_STREAM_ICON" variant="ghost"
            class="w-full justify-start" to="/curriculums/streams" @click="close">
            Streams
          </UButton>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <UButton to="/logout" icon="lucide:log-out" color="error" variant="ghost" class="w-full justify-start">
        Sign out
      </UButton>
    </template>
  </USlideover>
</template>
