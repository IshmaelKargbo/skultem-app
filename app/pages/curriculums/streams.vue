<template>
    <div class="p-5">
        <UCard>
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-xl font-semibold">Streams Management</p>
                <div>
                    <CurriculumsStreamAdd/>
                </div>
            </div>
            <CurriculumsStreamTable />
            <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useStreamStore())

onMounted(() => {
    useAppStore().setTitle('Streams')
    document.title = 'Streams | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>