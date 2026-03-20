<template>
    <UCard>
        <div class="space-y-2 text-center flex flex-col items-center">
            <USkeleton v-if="!isReady" class="w-20 h-8" />
            <p v-else class="text-2xl font-semibold">{{ count }}</p>
            <p>Class Rank</p>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const store = useStudentStore()

const { student, term } = defineProps<{
    student: Student
    term: string
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

    const rank = await store.fetchRank(student.id, term)

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