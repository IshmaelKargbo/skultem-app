<template>
  <div class="border-primary-200 px-3 pb-3 pt-2">
    <ul class="gap-2 grid grid-cols-4 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-2 py-3 bg-white dark:bg-gray-900 opacity-80">
      <li>
        <MenuItem label="Dashboard" exact to="/">
        <template #icon>
          <UIcon class="text-xl" :name="DASHBOARD_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.PARENT, Role.TEACHER])">
        <MenuItem label="Grade" exact to="/grades">
        <template #icon>
          <UIcon class="text-xl" :name="GRADES_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
        <MenuItem label="Students" exact to="/students">
        <template #icon>
          <UIcon class="text-xl" :name="STUDENT_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
        <MenuItem label="Classes" exact to="/classes">
        <template #icon>
          <UIcon class="text-xl" :name="CLASS_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])">
        <MenuItem label="Teachers" exact to="/teachers">
        <template #icon>
          <UIcon class="text-xl" :name="TEACHER_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.PARENT, Role.TEACHER])">
        <MenuItem label="Fees" exact to="/fees">
        <template #icon>
          <UIcon class="text-xl" :name="PAYMENT_ICON" />
        </template>
        </MenuItem>
      </li>
      <li v-if="can([Role.PARENT, Role.TEACHER])">
        <MenuItem label="Attendance" exact to="/attendance">
        <template #icon>
          <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
        </template>
        </MenuItem>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
