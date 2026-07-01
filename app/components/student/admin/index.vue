<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-4 pb-0 space-y-3">
        <UCard>
            <Heading title="Students Management" subtitle="Organize academic classes">
                <div class="flex space-x-2">
                    <UInput v-model="value" placeholder="Search by name or admission no" class="md:w-80" />
                    <UButton to="/students/add" class="items-center flex justify-center" color="primary"
                        label="Enrolled Student" :icon="ADD_ICON" />
                </div>
            </Heading>
        </UCard>
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
