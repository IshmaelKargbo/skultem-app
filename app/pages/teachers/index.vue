<template>
  <div class="space-y-5 p-4">

    <Heading title="Teachers" subtitle="Manage teacher accounts, assignments, and contact information.">
      <div class="flex  gap-3">
        <UInput v-model="value" icon="i-lucide-search" class="w-full sm:w-96"
          placeholder="Search by name, staff ID, email or phone" />

        <UButton to="/teachers/add" :icon="ADD_ICON" class="hidden md:flex" label="Add Teacher" />
        <UButton to="/teachers/add" :icon="ADD_ICON" class="md:hidden" />
      </div>
    </Heading>

    <TeacherTable />
  </div>
</template>

<script setup lang="ts">
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