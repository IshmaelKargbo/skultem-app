<template>
    <div class="p-4 space-y-4">
        <Heading title="Students Management" subtitle="Organize academic classes">
            <div class="flex space-x-2">
                <UInput v-model="value" placeholder="Search by name or admission no" class="md:w-80" />
                <UButton to="/students/add" class="items-center hidden md:flex justify-center" color="primary"
                    label="Enrolled Student" :icon="ADD_ICON" />
                <UButton to="/students/add" class="md:hidden" color="primary" :icon="ADD_ICON" />
            </div>
        </Heading>
        <StudentAdminTable />
    </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const value = ref(route.query.search as string || '')

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
