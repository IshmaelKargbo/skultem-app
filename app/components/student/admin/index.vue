<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Students Management" subtitle="Organize academic classes">
            <StudentAdd />
        </Heading>
        <StudentAdminTable v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const exportingCsv = ref(false)
const exportingPdf = ref(false)
const toast = useToast()
</script>
