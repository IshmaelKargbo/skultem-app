<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Behaviour Notes" subtitle="Record and manage behaviour observations for students in your class">
            <div class="flex space-x-3 md:w-1/3">
                <USelectMenu :items="classes" v-model="state.id" placeholder="Select class" value-key="value" />
                <BehaviourAdd @refresh="refreshReport" :clazz="clazzId" />
            </div>
        </Heading>
        <BehaviourReport ref="reportRef" :clazz="state.id" />
        <BehaviourTable :class-id="clazzId" />
    </div>
</template>

<script setup lang="ts">
const classSession = useTeacherSubjectStore()
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

const clazzId = ref()
const records = ref<TeacherSubject[]>([])
const classes = computed(() => records.value.map(e => ({
    label: `${e.subjectName} - ${e.className}(${e.sectionName})`,
    value: e.id
})))

const state = reactive({
    id: ''
})

watch(classes, (val) => {
    if (val.length && !state.id) {
        state.id = val[0].value
    }
}, { immediate: true })

watch(() => state.id, () => {
    const rec = records.value.find(e => e.id == state.id)
    if (rec) clazzId.value = rec.classId
}, { immediate: true })


onMounted(async () => {
    useAppStore().setTitle('Behaviours')
    document.title = 'Behaviours | Skultem'
    const res = await classSession.fetchAllByTeacher(0, 0)
    records.value = res
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PARENT, Role.TEACHER, Role.ACCOUNTANT]
})
</script>