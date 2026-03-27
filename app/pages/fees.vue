<script lang="ts" setup>
const {can} = useAuth()
onMounted(() => {
    useAppStore().setTitle('Fees')
    
    document.title = 'Fees | Skultem'
})

definePageMeta({
    role: [Role.PARENT, Role.TEACHER]
})
</script>

<template>
    <FeeParent v-if="can([Role.PARENT])" />
    <FeeTeacher v-if="can([Role.TEACHER])" />
</template>
