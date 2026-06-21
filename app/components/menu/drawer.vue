<template>
  <USlideover :open="open" side="left" :ui="{
    content: 'w-full max-w-sm bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-950 border-r border-neutral-200 dark:border-neutral-800'
  }" @update:open="open = $event">
    <!-- Trigger -->
    <UButton class="md:hidden" color="neutral" variant="ghost" icon="lucide:menu" @click="open = true" />
    <template #header>
      <div
        class="relative overflow-hidden w-full rounded-2xl border border-neutral-200/80 bg-white/90 p-3  dark:border-white/10 dark:bg-white/[0.03]">
        <div class="flex justify-between items-center gap-3">
          <div class="relative shrink-0">
            <UAvatar :alt="name" size="lg" class="ring-2 ring-white dark:ring-neutral-900" />

            <span
              class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-500" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {{ name }}
            </h3>

            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ user?.email }}
            </p>
          </div>

          <UButton icon="lucide:x" variant="ghost" color="neutral" size="xs" class="rounded-xl" @click="open = false" />
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="flex h-full flex-col overflow-y-auto pr-1">

        <!-- PROFILE -->
        <div class="pt-2">
          <!-- roles -->
          <div class="space-y-2 pb-5">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Switch Role
              </p>

              <div
                class="rounded-full border border-neutral-200 dark:border-white/10 px-2 py-1 text-[10px] text-neutral-500">
                {{ userRoles.length }} roles
              </div>
            </div>

            <button v-for="role in userRoles" :key="role.value"
              class="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200"
              :class="activeRole === role.value
                ? 'border-primary-500/20 bg-primary-500/[0.08]'
                : 'border-neutral-200/70 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] hover:border-primary-500/20 hover:bg-white dark:hover:bg-white/[0.05]'
                " @click="switchRole(role.value)">
              <!-- glow -->
              <div v-if="activeRole === role.value" class="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />

              <div class="flex h-11 w-11 items-center justify-center rounded-2xl transition-all" :class="activeRole === role.value
                ? 'bg-primary text-white shadow-lg shadow-primary-500/20'
                : 'bg-white dark:bg-white/[0.04] text-neutral-500 border border-neutral-200 dark:border-white/5'
                ">
                <UIcon :name="role.icon" class="text-base" />
              </div>

              <div class="min-w-0 flex-1 text-left">
                <p class="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {{ role.label }}
                </p>

                <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {{ role.desc }}
                </p>
              </div>

              <Transition enter-active-class="transition duration-200" enter-from-class="scale-75 opacity-0"
                enter-to-class="scale-100 opacity-100">
                <div v-if="activeRole === role.value"
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                  <UIcon name="lucide:check" class="size-3.5" />
                </div>
              </Transition>
            </button>
          </div>

        </div>

        <!-- QUICK LINKS -->
        <div
          class="mt-3 space-y-3 rounded-3xl border border-neutral-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.02]">

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.TEACHER, Role.PARENT])" to="/attendance"
            @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/attendance') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="ATTENDANCE_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Attendance
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.ACCOUNTANT])" to="/parents" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/parents') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="PARENT_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Parents
            </span>
          </NuxtLink>


          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER])" to="/teachers" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/teachers') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="TEACHER_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Teachers
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT])" to="/students" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/students') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="STUDENT_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Students
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PARENT])" to="/grades" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/grades') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="GRADES_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Grades
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PARENT])" to="/notifications" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/notifications') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="BELL_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Notifications
            </span>
          </NuxtLink>


          <NuxtLink v-if="can([Role.PARENT])" to="/fees" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/fees') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="PAYMENT_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Fees
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PARENT])" to="/performance" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/performance') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="PERFORMANCE_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Performance
            </span>
          </NuxtLink>

          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER])" to="/ledger" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/ledger') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="LEDGER_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Student Ledger
            </span>
          </NuxtLink>
          <NuxtLink v-if="can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER])" to="/transactions" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/transactions') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="TRANSACTION_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Transactions
            </span>
          </NuxtLink>
          <NuxtLink v-if="can([Role.PROPRIETOR, Role.OWNER])" to="/analytics" @click="close"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
            :class="route.path.startsWith('/analytics') ? 'border-primary/20 bg-primary-50 dark:bg-primary-500/10' : ''">
            <UIcon :name="ANALYTICS_ICON" class="size-7 text-neutral-700 dark:text-neutral-200" />

            <span class="text-[16px] font-medium">
              Analytics
            </span>
          </NuxtLink>

          <!-- SEE MORE -->
          <button
            class="w-full rounded-2xl border border-neutral-200 bg-neutral-100 py-4 text-center font-semibold text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
            See more
          </button>
        </div>

        <!-- ACCORDIONS -->
        <div class="my-6">

          <div v-for="section in sections" :key="section.id"
            class="mt-3 rounded-3xl border border-neutral-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.02]">
            <!-- header -->
            <button class="flex items-center justify-between w-full px-5 py-[18px]" @click="toggleSection(section.id)">
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
              <NuxtLink v-for="item in section.items.filter(x => !!x?.to)" :key="item.label" :to="item.to"
                @click="close"
                class="flex items-center gap-3 rounded-2xl border border-transparent bg-neutral-100 px-4 py-3.5 transition hover:border-primary/20 hover:bg-primary-50 hover:text-primary-600 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20 dark:hover:text-primary-200"
                :class="route.path.startsWith(item.to) ? 'border-primary/20 bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-neutral-700 dark:text-neutral-200'">
                <UIcon :name="item.icon" class="size-5" />

                <span class="font-medium">
                  {{ item.label }}
                </span>
              </NuxtLink>
              <button v-for="item in section.items.filter(x => !x?.to && !!x?.action)" :key="item.label"
                class="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-neutral-100 px-4 py-3.5 text-left transition hover:border-primary-500/30 hover:bg-primary-500/10 dark:bg-neutral-900 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/20"
                @click="item.action?.()">
                <UIcon :name="item.icon" class="size-5" />
                <span class="font-medium">
                  {{ item.label }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div
          class="sticky bottom-0 mt-auto border-t border-neutral-200/80 bg-white/95 px-5 py-5 backdrop-blur dark:border-white/10 dark:bg-neutral-950/95">
          <UButton to="/logout" color="neutral" variant="soft" block class="rounded-2xl text-base font-semibold">
            Log out
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const { activeRole, can, setActiveRole } = useAuth()
const { canInstall, install } = usePwaInstall()

const router = useRouter()
const route = useRoute()
const open = ref(false)

const expanded = ref<string[]>(['grades'])

const name = computed(() =>
  user.value
    ? `${user.value.givenNames} ${user.value.familyName}`
    : ''
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
  // grades
  {
    id: 'grades',
    title: 'Grades',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]),
    items: [
      can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]) && {
        label: 'Grade Approval',
        icon: GRADES_APPROVAL_ICON,
        to: '/grades/approval'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER,]) && {
        label: 'Grade Assignment',
        icon: 'lucide:clipboard-check',
        to: '/grades'
      }
    ].filter(Boolean)
  },  // subjects
  {
    id: 'subjects',
    title: 'Subjects',
    visible: can([Role.PROPRIETOR, Role.ADMIN]),
    items: [
      {
        label: 'Subjects',
        icon: SUBJECT_ICON,
        to: '/subjects'
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
        label: 'Streams Subjects',
        icon: CURRICULUM_STREAM_ICON,
        to: '/curriculums/streams'
      }
    ]
  },
  // classes
  {
    id: 'classes',
    title: 'Classes',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.ACCOUNTANT, Role.OWNER]),
    items: [
      {
        label: 'Classes',
        icon: CLASS_ICON,
        to: '/classes'
      },

      {
        label: 'Teacher Assignment',
        icon: CLIPBOARD_ADD_ICON,
        to: '/classes/teacher-assignment'
      },

      {
        label: 'Sections',
        icon: LAYERS_ICON,
        to: '/classes/sections'
      },

      {
        label: 'Streams',
        icon: CURRICULUM_STREAM_ICON,
        to: '/classes/streams'
      }
    ]
  },
  // curriculum
  {
    id: 'curriculum',
    title: 'Curriculum',
    visible: can([Role.PROPRIETOR, Role.ADMIN]),
    items: [
      {
        label: 'Scheme of Work',
        icon: SCHEME_ICON,
        to: '/curriculums/scheme-of-work'
      },

      {
        label: ' Lesson Plans ',
        icon: BOOK_OPEN_ICON,
        to: '/curriculums/lesson-plans'
      },

      {
        label: 'Weeks',
        icon: WEEKS_ICON,
        to: '/curriculums/weeks'
      },

      {
        label: 'Progress',
        icon: PROGRESS_ICON,
        to: '/curriculums/progress'
      },

      {
        label: 'Student Progress',
        icon: STUDENT_ICON,
        to: '/curriculums/student-progress'
      },

      {
        label: 'Teacher Progress',
        icon: TEACHER_ICON,
        to: '/curriculums/teacher-progress'
      },

      {
        label: 'Class Progress',
        icon: CLASS_ICON,
        to: '/curriculums/class-progress'
      }
    ]
  },
  // classes
  {
    id: 'behaviours',
    title: 'Behaviours',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]),
    items: [
      {
        label: 'Behaviours',
        icon: BEHAVIOUR_ICON,
        to: '/behaviours'
      },

      {
        label: 'Category',
        icon: CATEGORY_ICON,
        to: '/behaviours/category'
      },
    ]
  },
    // Timetable
  {
    id: 'timetable',
    title: 'Timetable',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]),
    items: [
      {
        label: 'Timetable',
        icon: TIMETABLE_ICON,
        to: '/timetable'
      },

      {
        label: 'Settings',
        icon: TIMETABLE_SETTINGS_ICON ,
        to: '/timetable/Setting'
      },
    ]
  },
  // expenses
  {
    id: 'expenses',
    title: 'Expenses',
    visible: can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]),
    items: [
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Expenses',
        icon: EXPENSES_ICON,
        to: '/expenses'
      },

      can([Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]) && {
        label: 'Expense Category',
        icon: CATEGORY_ICON,
        to: '/expenses/category'
      },


    ].filter(Boolean)
  },
  // academics
  {
    id: 'academics',
    title: 'Academics',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]),
    items: [
      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
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
  // authorization
  {
    id: 'authorization',
    title: 'Authorization',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]),
    items: [
      can([Role.PROPRIETOR, Role.OWNER]) && {
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
        label: 'Sessions',
        icon: SESSIONS_ICON,
        to: '/auth/sessions'
      },

    ].filter(Boolean)
  },
  // fees
  {
    id: 'fees',
    title: 'Fees & Payments',
    visible: can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]),
    items: [
      can([Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Student Fees',
        icon: STUDENT_FEES_ICON,
        to: '/fees-payment'
      },
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Payments',
        icon: PAYMENT_ICON,
        to: '/fees-payment/pay'
      },

      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Fee Structures',
        icon: FEE_STRUCTURE_ICON,
        to: '/fees-payment/structure'
      },

      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Discounts',
        icon: DISCOUNT_ICON,
        to: '/fees-payment/discounts'
      },
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Category',
        icon: CATEGORY_ICON,
        to: '/fees-payment/category'
      },

    ].filter(Boolean)
  },
  // materials
  {
    id: 'materials',
    title: 'Materials & Supplies',
    visible: can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]),
    items: [
      can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]) && {
        label: 'Materials',
        icon: MATERIAL_ICON,
        to: '/material'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Supplies',
        icon: CURRICULUM_GROUP_ICON,
        to: '/material/supply'
      },

      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: 'Category',
        icon: CATEGORY_ICON,
        to: '/material/category'
      },

    ].filter(Boolean)
  },
    // id-cards
  {
    id: 'id-cards',
    title: 'ID Cards',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]),
    items: [
      {
        label: 'ID Cards',
        icon: ID_CARD_ICON,
        to: '/id-cards'
      },

      {
        label: 'Generate',
        icon: GENERATE_ID_CARD_ICON ,
        to: '/id-cards/generate'
      },

       {
        label: 'Templates',
        icon: SETTINGS_ICON ,
        to: '/id-cards/templates'
      },
    ]
  },
 // id-cards
  {
    id: 'report-cards',
    title: 'Report Cards',
    visible: can([Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER]),
    items: [
      {
        label: 'Report Cards',
        icon: REPORT_ICON,
        to: '/report-cards'
      },

      {
        label: 'Generate',
        icon: GENERATE_ICON,
        to: '/report-cards/generate'
      },

       {
        label: 'Templates',
        icon: SETTINGS_ICON ,
        to: '/id-cards/templates'
      },
    ]
  },

].filter((section: any) => section?.visible !== false))

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
