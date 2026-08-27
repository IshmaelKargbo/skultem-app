<template>
    <div class="px-4 md:px-6 overflow-y-auto h-full space-y-4">
        <BehaviourReport ref="reportRef" :clazz="state.classId" />
        <BehaviourTable :state="state" />
    </div>
</template>

<script setup lang="ts">

const state = reactive({
    classId: ''
})

onMounted(async () => {
    useAppStore().setTitle('Behaviours')
    document.title = 'Behaviours | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PARENT, Role.TEACHER, Role.ACCOUNTANT]
})
</script>