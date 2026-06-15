<template>
  <UCard class="h-full flex flex-col" :ui="{
    body: 'flex-1 overflow-y-auto sm:p-0',
    footer: 'sm:p-5',
    header: 'sm:p-5'
  }">
    <!-- Header (fixed height) -->
    <template #header>
      <div class="flex items-center">
        <NuxtLink to="/" class="block dark:hidden">
          <img src="/menu-dark.svg" alt="Skultem" class="h-7" />
        </NuxtLink>

        <NuxtLink to="/" class="hidden dark:block">
          <img src="/menu-light.svg" alt="Skultem" class="h-7" />
        </NuxtLink>
      </div>
    </template>

    <!-- Scrollable Body -->
    <div class="h-full overflow-y-auto p-5">
      <ul class="space-y-1">
        <li>
          <MenuItem label="Dashboard" exact to="/">
            <template #icon>
              <UIcon class="text-xl" :name="DASHBOARD_ICON" />
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER, Role.PARENT])">
          <MenuItem label="Attendance" to="/attendance"> <template #icon>
              <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.TEACHER])">
          <MenuItem label="Behaviours" to="/behaviours"> <template #icon>
              <UIcon class="text-xl" :name="BEHAVIOUR_ICON" />
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Behaviours"
            :subNavs="[{ label: 'Behaviours', to: '/behaviours', icon: BEHAVIOUR_ICON, exact: true }, { label: 'Category', to: '/behaviours/category', icon: CATEGORY_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="BEHAVIOUR_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER])">
          <MenuItem label="Scheme of Work"
            :subNavs="[{ label: 'Scheme of Work', to: '/scheme-of-work', icon: SCHEME_ICON, exact: true },{label: ' Lesson Plans', to: '/scheme-of-work/lesson-plans', icon: BOOK_OPEN_ICON } ,{ label: 'Weeks', to: '/scheme-of-work/weeks', icon: WEEKS_ICON }, { label: 'Progress', to: '/scheme-of-work/progress', icon: PROGRESS_ICON }, { label: 'Student Progress', to: '/scheme-of-work/student-progress', icon: STUDENT_ICON },{ label: 'Teacher Progress', to: '/scheme-of-work/teacher-progress', icon: TEACHER_ICON }, { label: 'Class Progress', to: '/scheme-of-work/class-progress', icon: CLASS_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="SCHEME_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER])">
          <MenuItem label="Timetable"
            :subNavs="[{ label: 'Timetable', to: '/timetable', icon: TIMETABLE_ICON, exact: true }, { label: 'Settings', to: '/timetable/Setting', icon: TIMETABLE_SETTINGS_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="TIMETABLE_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER])">
          <MenuItem label="Grades"
            :subNavs="[{ label: 'Grade Assignment', to: '/grades', icon: GRADES_ASSIGN_ICON, exact: true }, { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="GRADES_ICON" />
            </template> <!-- Subnav Slot --> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <!-- Subnav icon -->
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PARENT])">
          <MenuItem label="Grades" to="/grades"> <template #icon>
              <UIcon class="text-xl" :name="GRADES_ICON" />
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PARENT])">
          <MenuItem to="/performance" label="Performance"> <template #icon>
              <UIcon class="text-xl" :name="PERFORMANCE_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT])">
          <MenuItem label="Students" to="/students"> <template #icon>
              <UIcon class="text-xl" :name="STUDENT_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR])">
          <MenuItem label="Teachers" to="/teachers"> <template #icon>
              <UIcon class="text-xl" :name="TEACHER_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT])">
          <MenuItem label="Parents" to="/parents"> <template #icon>
              <UIcon class="text-xl" :name="PARENT_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT])">
          <MenuItem label="Classes" to="/classes"> <template #icon>
              <UIcon class="text-xl" :name="CLASS_ICON" />
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR])">
          <MenuItem label="Subjects" to="/subjects"> <template #icon>
              <UIcon class="text-xl" :name="SUBJECT_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.PARENT, Role.TEACHER])">
          <MenuItem to="/fees" label="Fees"> <template #icon>
              <UIcon class="text-xl" :name="PAYMENT_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.PARENT])">
          <MenuItem to="/notifications" label="Notifications"> <template #icon>
              <UIcon class="text-xl" :name="BELL_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT])">
          <MenuItem label="Fees & Payments"
            :subNavs="[{ label: 'Fees', to: '/fees-payment', icon: STUDENT_FEES_ICON, exact: true }, { label: 'Payments', to: '/fees-payment/pay', icon: PAYMENT_ICON }, { label: 'Discounts', to: '/fees-payment/discounts', icon: DISCOUNT_ICON }, { label: 'Structures', to: '/fees-payment/structure', icon: FEE_STRUCTURE_ICON }, { label: 'Category', to: '/fees-payment/category', icon: CATEGORY_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="PAYMENT_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT])">
          <MenuItem label="Expenses"
            :subNavs="[{ label: 'Expenses', to: '/expenses', icon: EXPENSES_ICON, exact: true }, { label: 'Category', to: '/expenses/category', icon: CATEGORY_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="EXPENSES_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Curriculums"
            :subNavs="[{ label: 'Subjects', to: '/curriculums', icon: CURRICULUM_SUBJECT_ICON, exact: true }, { label: 'Subject Groups', to: '/curriculums/subject-groups', icon: CURRICULUM_GROUP_ICON }, { label: 'Class Subjects', to: '/curriculums/class-subjects', icon: BOOK_OPEN_ICON }, { label: 'Stream Subjects', to: '/curriculums/stream-subjects', icon: BOOK_OPEN_ICON }, { label: 'Teacher Assignment', to: '/curriculums/teacher-assignment', icon: CLIPBOARD_ADD_ICON }, { label: 'Sections', to: '/curriculums/sections', icon: LAYERS_ICON }, { label: 'Streams', to: '/curriculums/streams', icon: CURRICULUM_STREAM_ICON },]">
            <template #icon>
              <UIcon class="text-xl" :name="CURRICULUM_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Materials & Supplies"
            :subNavs="[{ label: 'Materials', to: '/material', icon: MATERIAL_ICON, exact: true }, { label: 'Supplies', to: '/material/supply', icon: CURRICULUM_GROUP_ICON }, { label: 'Category', to: '/material/category', icon: CATEGORY_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="MATERIAL_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Academics"
            :subNavs="[{ label: 'Academic Year', to: '/academics', icon: CALANDA_ICON, exact: true }, { label: 'Terms', to: '/academics/terms', icon: TERM_ICON }, { label: 'Template', to: '/academics/assessment-templates', icon: TEMPLATE_ICON }, { label: 'Academic Cycle', to: '/academics/assessment-cycle', icon: CYCLE_ICON }, { label: 'Grade Scale', to: '/academics/grade-scale', icon: GRADE_ICON }]">
            <template #icon>
              <UIcon class="text-xl" :name="ACADEMIC_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Settings"
            :subNavs="[{ label: 'Holidaies', to: '/settings', icon: HOLIDAY_ICON, exact: true }]">
            <template #icon>
              <UIcon class="text-xl" :name="SETTINGS_ICON" />
            </template> <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER])">
          <MenuItem to="/ledger" label="Student Ledger"> <template #icon>
              <UIcon class="text-xl" :name="LEDGER_ICON" />
            </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER])">
          <MenuItem to="/transactions" label="Transactions"> <template #icon>
              <UIcon class="text-xl" :name="TRANSACTION_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.PROPRIETOR, Role.OWNER])">
          <MenuItem to="/analytics" label="Analytics"> <template #icon>
              <UIcon class="text-xl" :name="ANALYTICS_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ACCOUNTANT, Role.OWNER])">
          <MenuItem to="/reports" label="Reports"> <template #icon>
              <UIcon class="text-xl" :name="REPORT_ICON" />
            </template> </MenuItem>
        </li>
        <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
          <MenuItem label="Auth"
            :subNavs="[{ label: 'Users', to: '/auth', icon: USERS_ICON, exact: true }, { label: 'Audits', to: '/auth/audits', icon: AUDIT_ICON }, { label: 'Sessions', to: '/auth/sessions', icon: SESSIONS_ICON },]">
            <!-- Parent Icon --> <template #icon>
              <UIcon class="text-xl" :name="AUTH_ICON" />
            </template> <!-- Subnav Slot -->
            <template #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav) ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300'">
                  <!-- Subnav icon -->
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" /> <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
      </ul>
    </div>
    <!-- <template #footer>
      <Board />
    </template> -->
  </UCard>
</template>
<script setup lang="ts">
const { can } = useAuth()
</script>
