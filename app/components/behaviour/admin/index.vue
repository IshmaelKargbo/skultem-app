<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Behaviour Notes" subtitle="Record and manage behaviour observations for students in your class">
            <div class="flex space-x-3 md:w-1/3 w-full">
                <USelectMenu :items="classes" v-model="state.classId" placeholder="Select class" value-key="value" />
                <BehaviourAdd @refresh="refreshReport" :clazz="state.classId" />
            </div>
        </Heading>
        <BehaviourReport ref="reportRef" :clazz="state.classId" />
        <BehaviourTable :class-id="state.classId" />
    </div>
</template>

<script setup lang="ts">
const classSession = useClassSessionStore()
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

const classes = computed(() => classSession.records.map(e => ({
    label: parseClassSession(e),
    value: e.clazzId
})))

const state = reactive({
    classId: ''
})

watch(classes, (val) => {
    if (val.length && !state.classId) {
        state.classId = val[0].value
    }
}, { immediate: true })


onMounted(async () => {
    useAppStore().setTitle('Behaviours')
    document.title = 'Behaviours | Skultem'
    await classSession.fetchAll(0, 0)
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PARENT, Role.TEACHER, Role.ACCOUNTANT]
})
</script>