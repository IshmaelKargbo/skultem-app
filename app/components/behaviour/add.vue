<template>
  <USlideover :dismissible="false" :open="open" @update:open="open = $event">

    <!-- Trigger -->
    <UButton color="primary" label="Add Behaviour" :disabled="!clazz" icon="prime:plus" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Behaviour</p>
        <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">

        <!-- Student -->
        <UFormField required label="Student" name="studentId">
          <USelectMenu v-model="state.studentId" :items="students" value-key="value" placeholder="Select student"
            :disabled="isLoading" />
        </UFormField>

        <!-- Behaviour Type -->
        <UFormField required label="Behaviour Type" name="type">
          <URadioGroup v-model="state.kind" :items="types" variant="card" :disabled="isLoading" />
        </UFormField>

        <!-- Category -->
        <UFormField required label="Category" name="categoryId">
          <USelectMenu v-model="state.categoryId" value-key="value" :items="categories" placeholder="Select category"
            :disabled="isLoading" />
        </UFormField>

        <!-- Note -->
        <UFormField label="Note" name="note">
          <UTextarea v-model="state.note" placeholder="Write additional note" :disabled="isLoading" />
        </UFormField>

      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton icon="lucide:save" label="Save" :loading="isLoading" @click="formRef?.submit()" />

        <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
      </div>
    </template>

  </USlideover>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { reactive, ref, computed, onMounted } from "vue"
import type { FormSubmitEvent } from "#ui/types"

const { clazz } = defineProps<{
  clazz: string
}>()

const emit = defineEmits(["refresh"])

const behaviourStore = useBehaviourStore()
const studentStore = useStudentStore()
const categoryStore = useBehaviourCategoryStore()
const toast = useToast()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref<any>(null)

const students = ref<{ label: string, value: string }[]>()

const categories = computed(() =>
  categoryStore.records.map(c => ({
    label: c.name,
    value: c.id
  }))
)

const types = [
  {
    label: "Positive",
    value: "POSITIVE",
    description: "Highlights good behavior, achievements, or commendable actions by the student."
  },
  {
    label: "Negative",
    value: "NEGATIVE",
    description: "Records misconduct, rule violations, or behavior that requires correction."
  },
  {
    label: "Neutral",
    value: "NEUTRAL",
    description: "General observations or notes that are neither positive nor negative."
  }
]

type BehaviourForm = {
  studentId: string
  kind: string
  categoryId: string
  note: string
}

const state = reactive<BehaviourForm>({
  studentId: "",
  kind: "",
  categoryId: "",
  note: ""
})

const schema = yup.object({
  studentId: yup.string().required("Student is required"),
  kind: yup.string().required("Behaviour type is required"),
  categoryId: yup.string().required("Category is required"),
  note: yup.string().nullable()
})

const close = () => {
  open.value = false
  state.studentId = ""
  state.kind = ""
  state.categoryId = ""
  state.note = ""
}

const onSubmit = async (event: FormSubmitEvent<BehaviourForm>) => {
  isLoading.value = true

  try {
    await behaviourStore.create({
      enrollment: state.studentId,
      kind: state.kind,
      category: state.categoryId,
      note: state.note
    })

    toast.add({
      description: "Behaviour recorded successfully",
      color: "success"
    })

    await behaviourStore.fetchAll(clazz)
    emit("refresh")
    close()

  } catch (err: any) {
    toast.add({
      description: err?.message || "Something went wrong",
      color: "error"
    })
  } finally {
    isLoading.value = false
  }
}

watch(() => clazz, async () => {
  if (clazz == null || clazz == "") return
  const res = await studentStore.getAllEnrollmentByClass(clazz)

  if (res == null) return
  students.value = (res.records as Student[]).map((s: Student) => ({
    label: `${s.givenNames} ${s.familyName}`,
    value: s.enrollmentId
  }))
}, { immediate: true })

onMounted(() => {
  studentStore.fetchAll()
  categoryStore.fetchAll()
})
</script>