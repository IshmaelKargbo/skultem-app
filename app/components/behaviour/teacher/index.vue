<template>
    <div class="md:px-6 px-4 space-y-4">
        <Heading title="Behaviours" subtitle="Track and record behaviour notes for your classes">
            <USelectMenu :loading="loading" :items="classes" v-model="state.id" placeholder="Select class"
                value-key="value" class="w-full md:w-72" />
        </Heading>
        <BehaviourReport ref="reportRef" :clazz="clazzId" />
        <BehaviourTable :state="{ classId: clazzId }" :selectable="false" />
    </div>
</template>

<script setup lang="ts">
const classSession = useTeacherSubjectStore()
const reportRef = ref()
const loading = ref(true)

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
    loading.value = true
    const res = await classSession.fetchAllByTeacher(0, 0)
    records.value = res
    loading.value = false
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PARENT, Role.TEACHER, Role.ACCOUNTANT]
})
</script>
