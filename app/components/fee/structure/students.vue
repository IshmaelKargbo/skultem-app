<script lang="ts" setup>
const props = defineProps<{
    modelValue?: string[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void
    (e: 'select', value: string[]): void
}>()

const store = useStudentStore()
const { records, meta, loading } = storeToRefs(store)

const page = ref(1)
const search = ref('')

const state = reactive({
    selects: props.modelValue ?? []
})

watch(
    () => props.modelValue,
    (value) => {
        state.selects = value ?? []
    }
)

watch(
    () => state.selects,
    (value) => {
        emit('update:modelValue', value)
        emit('select', value)
    },
    { deep: true }
)

async function fetchStudents() {
    await store.fetchAll(page.value, 7)
}

watch(page, fetchStudents)

watch(search, () => {
    page.value = 1
    fetchStudents()
})

onMounted(fetchStudents)

function isSelected(id: string) {
    return state.selects.includes(id)
}

function toggleSelect(id: string) {
    if (isSelected(id)) {
        state.selects = state.selects.filter((x) => x !== id)
    } else {
        state.selects.push(id)
    }
}
</script>

<template>
    <div class="space-y-4">

        <!-- Search -->
        <UInput v-model="search" icon="lucide:search" placeholder="Search by name or admission number" />

        <!-- Students -->
        <div v-for="item in records" :key="item.id"
            class="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer" :class="[
                isSelected(item.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/40'
            ]" @click="toggleSelect(item.id)">
            <div class="flex items-center space-x-3">

                <!-- Checkbox -->
                <UCheckbox :model-value="isSelected(item.id)" @update:model-value="toggleSelect(item.id)" @click.stop />

                <!-- Avatar -->
                <UAvatar :alt="`${item.givenNames} ${item.familyName}`" />

                <!-- Info -->
                <div class="flex flex-col">
                    <p class="font-medium">
                        {{ item.givenNames }} {{ item.familyName }}
                    </p>

                    <p class="text-xs text-muted">
                        {{ item.admissionNumber }}
                    </p>
                </div>
            </div>

            <!-- Class -->
            <UBadge :label="item.className" variant="outline" />
        </div>

        <!-- Empty -->
        <UAlert v-if="!loading && records.length === 0" color="neutral" variant="outline" title="No students found"
            description="Try adjusting your search criteria." />

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-200 pt-3">
            <Showing :meta="meta" />

            <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                :total="meta.total" show-edges />
        </div>
    </div>
</template>