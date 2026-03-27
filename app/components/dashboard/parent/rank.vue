<template>
    <div class="justify-between flex py-2 border-gray-200">
        <p class="text-muted">Class Rank:</p>
        <USkeleton v-if="!isReady" class="w-20 h-2" />
        <p v-else>{{ count }}</p>
    </div>
</template>

<script setup lang="ts">
const store = useStudentStore()

const { student, term } = defineProps<{
    student: Student | undefined
    term: string | undefined
}>()

const isReady = ref(false)
const count = ref("0")

function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`
}

async function fetchRecord() {
    if (term == "") return
    if (student == null) return

    const rank = await store.fetchRank(student?.id, term || '')

    count.value = ordinal(Number(rank))
    isReady.value = true
}

watch(
    () => term,
    async () => {
        isReady.value = false
        await fetchRecord()
    },
    { immediate: true }
)
</script>