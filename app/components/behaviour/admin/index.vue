<template>
    <div class="px-4 md:px-6 overflow-y-auto h-full space-y-3">
        <div data-guide="beh-tabs"><BehaviourSectionNav /></div>
        <GuideBar topic="admin-behaviours" />
        <div data-guide="beh-stats"><BehaviourReport ref="reportRef" :clazz="state.classId" /></div>
        <div data-guide="beh-list"><BehaviourTable :state="state" /></div>
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