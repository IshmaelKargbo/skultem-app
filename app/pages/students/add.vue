<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 space-y-3">
        <Heading title="Enroll Student" subtitle="Add a new student to the system and assign their academic details." />
        <div class="flex space-x-5">
            <div class="w-1/4">
                <UCard>
                    <div class="space-y-3">
                        <p>Progress</p>
                        <div class=" space-y-3">
                            <div v-for="value, i in step"
                                class="border p-3 flex space-x-2 items-center rounded-xl border-white">
                                <div>
                                    <UAvatar :alt="(i + 1).toString()" />
                                </div>
                                <div>
                                    <p>{{ value.title }}</p>
                                    <p class="text-xs text-gray-300">{{ value.sub }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <div class="flex-1">
                <UCard>
                    <div>

                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})

const step = [
    {
        title: "Personal Information",
        sub: "Student’s basic details"
    },
    {
        title: "Parent / Guardian",
        sub: "Parent or guardian details"
    },
    {
        title: "Academic Information",
        sub: "admission, enrollment details."
    }
]

onMounted(() => {
    useAppStore().setTitle('Students');
    document.title = 'Students | Skultem'
})
</script>
