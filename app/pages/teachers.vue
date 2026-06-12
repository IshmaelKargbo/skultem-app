<template>
    <div class="md:p-5 p-4 py-2 md:py-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Teachers Management" subtitle="Manage all teachers">
            <div class="flex space-x-2">
                <UInput v-model="value" placeholder="Search by staff id, name, email or phone" />
                <TeacherAdd />
            </div>
        </Heading>
        <TeacherTable />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const value = ref(route.query.search as string || '')

onMounted(() => {
    useAppStore().setTitle('Teachers');

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