<template>
  <div class="border-r flex flex-col border-gray-200 bg-menu text-white">
    <!-- Header -->
    <div class="flex h-14 p-4 px-5 border-b border-gray-800 space-x-2 items-center">
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
            <UIcon class="text-xl" name="si:dashboard-customize-line" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem label="Grades" :subNavs="[
            { label: 'Grade Assignment', to: '/grades', icon: 'si:assignment-line', exact: true },
            { label: 'Grade Approval', to: '/grades/approval', icon: 'material-symbols:order-approve-outline' }
          ]">
          <template #icon>
            <UIcon class="text-xl" name="carbon:cobol-upgrade-advisor" />
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
        <li>
          <MenuItem label="Attendance" to="/attendance">
          <template #icon>
            <UIcon class="text-xl" name="hugeicons:date-time" />
          </template>
          </MenuItem>
        </li>

        <li>
          <MenuItem label="Students" to="/students">
          <template #icon>
            <UIcon class="text-xl" name="hugeicons:student" />
          </template>
          </MenuItem>
        </li>

        <li>
          <MenuItem label="Teachers" to="/teachers">
          <template #icon>
            <UIcon class="text-xl" name="hugeicons:teaching" />
          </template>
          </MenuItem>
        </li>

        <li>
          <MenuItem label="Classes" to="/classes">
          <template #icon>
            <UIcon class="text-xl" name="streamline-plump:class-lesson" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem label="Subjects" to="/subjects">
          <template #icon>
            <UIcon class="text-xl" name="ph:books" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem to="/fees-structures" label="Fees Structures">
          <template #icon>
            <UIcon class="text-xl" name="si:assignment-duotone" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem label="Student Fees" to="/student-fees">
          <template #icon>
            <UIcon class="text-xl" name="fluent:feed-28-regular" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem to="/payments" label="Payments">
          <template #icon>
            <UIcon class="text-xl" name="streamline-ultimate:cash-payment-bills" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem label="Discounts" to="/discounts">
          <template #icon>
            <UIcon class="text-xl" name="mdi:discount-outline" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem to="/ledger" label="Ledger">
          <template #icon>
            <UIcon class="text-xl" name="solar:book-broken" />
          </template>
          </MenuItem>
        </li>
        <li>
          <MenuItem label="Curriculums" :subNavs="[
            { label: 'Subjects', to: '/curriculums', icon: 'carbon:document-subject', exact: true },
            { label: 'Subject Groups', to: '/curriculums/subject-groups', icon: 'clarity:file-group-line' },
            { label: 'Class Subjects', to: '/curriculums/class-subjects', icon: 'lineicons:books-2' },
            { label: 'Stream Subjects', to: '/curriculums/stream-subjects', icon: 'lineicons:books-2' },
            { label: 'Teacher Assignment', to: '/curriculums/teacher-assignment', icon: 'material-symbols:assignment-add-outline-rounded' },
            { label: 'Sections', to: '/curriculums/sections', icon: 'tabler:section' },
            { label: 'Streams', to: '/curriculums/streams', icon: 'carbon:downstream' },
          ]">
          <!-- Parent Icon -->
          <template #icon>
            <UIcon class="text-xl" name="streamline:business-user-curriculum" />
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
        <li>
          <MenuItem to="/settings" label="Settings">
          <template #icon>
            <UIcon class="text-xl" name="ph:gear-light" />
          </template>
          </MenuItem>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="h-28 p-4 border-t border-gray-800 space-y-2.5">
      <div class="flex flex-col ">
        <p class="text-sm">Ishmael Kargbo</p>
        <p class="text-xs text-muted">Ishmaelkargbo@skultem.com</p>
      </div>
      <UButton icon="hugeicons:logout-circle-02" label="Logout" variant="subtle" class="w-full flex justify-center" />
    </div>
  </div>
</template>