<template>
  <USlideover :open="open" side="left" :ui="{
    content: 'w-full max-w-sm bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800'
  }" @update:open="open = $event">
    <!-- Trigger -->
    <UButton class="md:hidden" color="neutral" variant="ghost" icon="lucide:menu" @click="open = true" />

    <!-- BODY -->
    <template #body>
      <div class="flex h-full flex-col">

        <!-- PROFILE -->
        <div class="pt-5">
          <div class="rounded-[28px] bg-neutral-100 dark:bg-neutral-900 px-4 py-4">
            <div class="flex items-center justify-between gap-3">

              <!-- user -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="relative shrink-0">
                  <UAvatar :alt="name" :text="initials" size="lg" />

                  <span
                    class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 bg-green-500" />
                </div>

                <div class="min-w-0">
                  <p class="truncate text-[17px] font-semibold">
                    {{ name }}
                  </p>

                  <p class="text-xs text-muted capitalize mt-0.5">
                    {{ clean(activeRole) }}
                  </p>
                </div>
              </div>

              <!-- role dropdown -->
              <UDropdownMenu :items="userRoles.map(role => ({
                label: role.label,
                icon: role.icon,
                click: () => switchRole(role.value)
              }))" :ui="{
                  content: 'w-52'
                }">
                <UButton color="neutral" variant="soft" icon="lucide:chevron-down"
                  class="rounded-full w-11 h-11 justify-center" />
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <!-- QUICK LINKS -->
        <div class=" pt-5 space-y-3">

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN])" to="/attendance" @click="close"
            class="flex items-center gap-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-4 py-4 transition hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <UIcon :name="ATTENDANCE_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Attendance
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.TEACHER, Role.PROPRIETOR])" to="/behaviours" @click="close"
            class="flex items-center gap-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-4 py-4 transition hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <UIcon :name="BEHAVIOUR_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Behaviours
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN])" to="/parents" @click="close"
            class="flex items-center gap-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-4 py-4 transition hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <UIcon :name="PARENT_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Parents
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN])" to="/subjects" @click="close"
            class="flex items-center gap-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-4 py-4 transition hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <UIcon :name="SUBJECT_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Subjects
            </span>
          </NuxtLink>

          <!-- SEE MORE -->
          <button
            class="w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800 py-4 text-center font-semibold transition hover:opacity-90">
            See more
          </button>
        </div>

        <!-- ACCORDIONS -->
        <div class="mt-6">

          <div v-for="section in sections" :key="section.id"
            class="border-t border-neutral-200 dark:border-neutral-800">
            <!-- header -->
            <button class="flex items-center justify-between w-full px-5 py-5" @click="toggleSection(section.id)">
              <div class="flex items-center gap-4">
                <UIcon :name="section.icon" class="size-7" />

                <span class="text-[16px] font-medium">
                  {{ section.title }}
                </span>
              </div>

              <UIcon name="lucide:chevron-down" class="size-5 transition-transform"
                :class="expanded.includes(section.id) ? 'rotate-180' : ''" />
            </button>

            <!-- items -->
            <div v-if="expanded.includes(section.id)" class="px-5 pb-5 space-y-2">
              <NuxtLink v-for="item in section.items" :key="item.label" :to="item.to" @click="close"
                class="flex items-center gap-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-4 py-3.5 transition hover:bg-neutral-200 dark:hover:bg-neutral-800">
                <UIcon :name="item.icon" class="size-5" />

                <span class="font-medium">
                  {{ item.label }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="mt-auto px-5 py-5">
          <UButton to="/logout" color="neutral" variant="soft" block class="h-14 rounded-2xl text-base font-semibold">
            Log out
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const { activeRole, can, setActiveRole } = useAuth()
const { canInstall, install } = usePwaInstall()

const router = useRouter()
const open = ref(false)

const expanded = ref<string[]>(['grades'])

const name = computed(() =>
  user.value
    ? `${user.value.givenNames} ${user.value.familyName}`
    : ''
)

const initials = computed(() =>
  name.value
    .split(' ')
    .map(v => v[0])
    .join('')
    .slice(0, 2)
)

const roleDesc: Record<string, string> = {
  PROPRIETOR: 'School owner & oversight',
  ADMIN: 'Full system access',
  TEACHER: 'Classes & students',
  PARENT: 'Child progress',
  ACCOUNTANT: 'Finance & fees'
}

const roleIcons: Record<string, string> = {
  PROPRIETOR: 'lucide:crown',
  ADMIN: 'lucide:shield-check',
  TEACHER: 'lucide:graduation-cap',
  PARENT: 'lucide:users',
  ACCOUNTANT: 'lucide:calculator'
}

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((role: string) => ({
    value: role,
    label: clean(role),
    desc: roleDesc[role] ?? 'Access level',
    icon: roleIcons[role] ?? 'lucide:user'
  }))
)

const sections = computed(() => [
  {
    id: 'general',
    title: 'General',
    items: [
      can(['admin', 'proprietor']) && {
        label: 'Settings',
        icon: 'lucide:settings-2',
        to: '/settings'
      },

      {
        label: 'Notifications',
        icon: BELL_ICON,
        to: '/notifications'
      },

      canInstall && {
        label: 'Install App',
        icon: 'lucide:download',
        action: installApp
      }
    ].filter(Boolean)
  },

  // ONLY GRADES DROPDOWN
  {
    id: 'grades',
    title: 'Grades',
    items: [
      can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER]) && {
        label: 'Grade Approval',
        icon: GRADES_APPROVAL_ICON,
        to: '/grades/approval'
      },

      can([Role.PROPRIETOR, Role.ADMIN]) && {
        label: 'Grade Assignment',
        icon: 'lucide:clipboard-check',
        to: '/grades/assignment'
      }
    ].filter(Boolean)
  },
  {
    id: 'expenses',
    title: 'Expenses',
    items: [
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Expenses',
        icon: EXPENSES_ICON,
        to: '/expenses'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER]) && {
        label: 'Expense Category',
        icon: CATEGORY_ICON,
        to: '/settings/expense-categories'
      },


    ].filter(Boolean)
  },
  {
    id: 'academics',
    title: 'Academics',
    items: [
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Academics',
        icon: CALANDA_ICON,
        to: '/academics'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Term Settings',
        icon: TERM_ICON,
        to: '/academics/terms'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Template',
        icon: TEMPLATE_ICON,
        to: '/academics/assessment-templates'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Academic Cycle',
        icon: CYCLE_ICON,
        to: '/academics/assessment-cycle'
      },

       can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Grade Scale',
        icon: GRADE_ICON,
        to: '/academics/grade-scale'
      },

    ].filter(Boolean)
  },
 {
    id: 'authorization',
    title: 'Authorization',
    items: [
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Users',
        icon: USERS_ICON,
        to: '/auth'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Audits',
        icon: AUDIT_ICON,
        to: '/auth/audits'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'sessions',
        icon: SESSIONS_ICON,
        to: '/auth/sessions'
      },

    ].filter(Boolean)
  },

  {
    id: 'finance',
    title: 'Finance',
    visible: can([Role.PROPRIETOR, Role.ADMIN]),
    items: [
      {
        label: 'Fee Structures',
        icon: FEE_STRUCTURE_ICON,
        to: '/fees-structures'
      },

      {
        label: 'Student Fees',
        icon: STUDENT_FEES_ICON,
        to: '/student-fees'
      },

      {
        label: 'Discounts',
        icon: DISCOUNT_ICON,
        to: '/discounts'
      },

      {
        label: 'Expenses',
        icon: EXPENSES_ICON,
        to: '/expenses'
      },

      {
        label: 'Ledger',
        icon: LEDGER_ICON,
        to: '/ledger'
      },

      {
        label: 'Transactions',
        icon: TRANSACTION_ICON,
        to: '/transactions'
      },

      {
        label: 'Analytics',
        icon: ANALYTICS_ICON,
        to: '/analytics'
      }
    ]
  },

  {
    id: 'curriculum',
    title: 'Curriculum',
    visible: can([Role.PROPRIETOR, Role.ADMIN]),
    items: [
      {
        label: 'Curriculums',
        icon: CURRICULUM_ICON,
        to: '/curriculums'
      },

      {
        label: 'Subject Groups',
        icon: CURRICULUM_GROUP_ICON,
        to: '/curriculums/subject-groups'
      },

      {
        label: 'Class Subjects',
        icon: BOOK_OPEN_ICON,
        to: '/curriculums/class-subjects'
      },

      {
        label: 'Teacher Assignment',
        icon: CLIPBOARD_ADD_ICON,
        to: '/curriculums/teacher-assignment'
      },

      {
        label: 'Sections',
        icon: LAYERS_ICON,
        to: '/curriculums/sections'
      },

      {
        label: 'Streams',
        icon: CURRICULUM_STREAM_ICON,
        to: '/curriculums/streams'
      }
    ]
  }
])

function toggleSection(id: string) {
  expanded.value.includes(id)
    ? expanded.value = expanded.value.filter(v => v !== id)
    : expanded.value.push(id)
}

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
