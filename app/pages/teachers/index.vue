<template>
  <div class="space-y-6 p-4 sm:p-6 lg:p-7 ">
    <Heading
      title="Teachers"
      subtitle="Manage teacher accounts, assignments, and contact information."
    >
      <div class="flex flex-col gap-3 sm:flex-row">

        <UInput
          v-model="value"
          icon="i-lucide-search"
          class="w-full sm:w-96"
          placeholder="Search by name, staff ID, email or phone"
        />

        <UButton
          to="/teachers/add"
          icon="i-lucide-user-round-plus"
          label="Add Teacher"
        />

      </div>
    </Heading>

    <!-- Table -->
    <TeacherTable />

  </div>
</template>

<script setup lang="ts">
const teacherStore = useTeacherStore()

const route = useRoute()
const router = useRouter()

const value = ref((route.query.search as string) || '')

onMounted(() => {
  useAppStore().setTitle('Teachers')

  document.title = 'Teachers | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

let timeout: ReturnType<typeof setTimeout>

watch(value, (search) => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    router.replace({
      query: {
        ...route.query,
        search: search || undefined
      }
    })
  }, 500)
})
</script>