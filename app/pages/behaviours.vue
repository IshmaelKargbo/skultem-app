<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <div class="flex justify-between items-center">
            <div>
                <p class="text-2xl font-semibold">Behaviour Notes</p>
                <p class="text-mute">Record and manage behaviour observations for students in your class.</p>
            </div>
            <div class="flex space-x-3 w-1/3">
                <USelectMenu :items="classes" v-model="state.classId" placeholder="Select class" value-key="value" />
                <BehaviourAdd @refresh="refreshReport" :clazz="state.classId" />
            </div>
        </div>
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

const classes = computed(() => classSession.records.map(e => ({ label: parseClassSession(e), value: e.clazzId })))

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
</script>