<template>
  <div class="border-r flex flex-col border-gray-200 p-1.5 bg-menu text-white ">
    <ul class="gap-2 grid grid-cols-4">
      <li>
        <MenuItem label="Dashboard" exact to="/">
        <template #icon>
          <UIcon class="text-xl" :name="DASHBOARD_ICON" />
        </template>
        </MenuItem>
      </li>
      <li>
        <MenuItem label="Grade" exact to="/grades">
        <template #icon>
          <UIcon class="text-xl" :name="GRADES_ICON" />
        </template>
        </MenuItem>
      </li>
      <li>
        <MenuItem label="Fees" exact to="/fees">
        <template #icon>
          <UIcon class="text-xl" :name="PAYMENT_ICON" />
        </template>
        </MenuItem>
      </li>
      <li>
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
