<template>
  <div class="border-r flex flex-col border-gray-200 bg-menu text-white">
    <!-- Header -->
    <div class="flex h-16 p-4 px-5 border-b border-gray-800 space-x-2 items-center">
      <nuxt-link to="/">
        <img src="/menu-light.svg" class="h-7" />
      </nuxt-link>
    </div>

    <!-- Menu -->
    <div class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-1">
        <li>
          <MenuItem label="Dashboard" exact to="/">
          <template #icon>
            <UIcon class="text-xl" :name="DASHBOARD_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.TEACHER])">
          <MenuItem label="Grades" :subNavs="[
            { label: 'Grade Assignment', to: '/grades', icon: GRADES_ASSIGN_ICON, exact: true },
            { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON }
          ]">
          <template #icon>
            <UIcon class="text-xl" :name="GRADES_ICON" />
          </template>

          <!-- Subnav Slot -->
          <template #subNav="{ subNavs, isActiveSub }">
            <div class="flex flex-col space-y-1">
              <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                class="flex items-center space-x-2 p-1 rounded-md hover:text-blue-400 transition"
                :class="isActiveSub(nav) ? 'font-semibold text-blue-400' : 'text-gray-400'">
                <!-- Subnav icon -->
                <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" />
                <span>{{ nav.label }}</span>
              </NuxtLink>
            </div>
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PARENT])">
          <MenuItem label="Grades" to="/grades">
          <template #icon>
            <UIcon class="text-xl" :name="GRADES_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT])">
          <MenuItem label="Attendance" to="/attendance">
          <template #icon>
            <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Students" to="/students">
          <template #icon>
            <UIcon class="text-xl" :name="STUDENT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.TEACHER])">
          <MenuItem label="Behaviours" to="/behaviours">
          <template #icon>
            <UIcon class="text-xl" :name="BEHAVIOUR_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Teachers" to="/teachers">
          <template #icon>
            <UIcon class="text-xl" :name="TEACHER_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Parents" to="/parents">
          <template #icon>
            <UIcon class="text-xl" :name="PARENT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Classes" to="/classes">
          <template #icon>
            <UIcon class="text-xl" :name="CLASS_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Subjects" to="/subjects">
          <template #icon>
            <UIcon class="text-xl" :name="SUBJECT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem to="/fees-structures" label="Fees Structures">
          <template #icon>
            <UIcon class="text-xl" :name="FEE_STRUCTURE_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.PARENT])">
          <MenuItem to="/fees" label="Fees">
          <template #icon>
            <UIcon class="text-xl" :name="PAYMENT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Student Fees" to="/student-fees">
          <template #icon>
            <UIcon class="text-xl" :name="STUDENT_FEES_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem to="/payments" label="Payments">
          <template #icon>
            <UIcon class="text-xl" :name="PAYMENT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Discounts" to="/discounts">
          <template #icon>
            <UIcon class="text-xl" :name="DISCOUNT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem to="/ledger" label="Ledger">
          <template #icon>
            <UIcon class="text-xl" :name="LEDGER_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem to="/analytics" label="Analytics">
          <template #icon>
            <UIcon class="text-xl" :name="REPORT_ICON" />
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem label="Curriculums" :subNavs="[
            { label: 'Subjects', to: '/curriculums', icon: CURRICULUM_SUBJECT_ICON, exact: true },
            { label: 'Subject Groups', to: '/curriculums/subject-groups', icon: CURRICULUM_GROUP_ICON },
            { label: 'Class Subjects', to: '/curriculums/class-subjects', icon: BOOK_OPEN_ICON },
            { label: 'Stream Subjects', to: '/curriculums/stream-subjects', icon: BOOK_OPEN_ICON },
            { label: 'Teacher Assignment', to: '/curriculums/teacher-assignment', icon: CLIPBOARD_ADD_ICON },
            { label: 'Sections', to: '/curriculums/sections', icon: LAYERS_ICON },
            { label: 'Streams', to: '/curriculums/streams', icon: CURRICULUM_STREAM_ICON },
          ]">
          <!-- Parent Icon -->
          <template #icon>
            <UIcon class="text-xl" :name="CURRICULUM_ICON" />
          </template>

          <!-- Subnav Slot -->
          <template #subNav="{ subNavs, isActiveSub }">
            <div class="flex flex-col space-y-1">
              <NuxtLink v-for="nav in subNavs" :key="nav.to" :to="nav.to" :exact="nav.exact"
                class="flex items-center space-x-2 p-1 rounded-md hover:text-blue-400 transition"
                :class="isActiveSub(nav) ? 'font-semibold text-blue-400' : 'text-gray-400'">
                <!-- Subnav icon -->
                <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" />
                <span>{{ nav.label }}</span>
              </NuxtLink>
            </div>
          </template>
          </MenuItem>
        </li>
        <li v-if="can([Role.SCHOOL_ADMIN, Role.ACCOUNTANT])">
          <MenuItem to="/settings" label="Settings">
          <template #icon>
            <UIcon class="text-xl" :name="SETTINGS_ICON" />
          </template>
          </MenuItem>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
