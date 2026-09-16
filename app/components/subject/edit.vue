<template>
  <u-slideover
    :dismissible="false"
    title="Edit Subject"
    :open="open"
    @update:open="(value) => emit('update:open', value)"
  >
    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Edit Subject</p>
        <u-button :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body / Form -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4 w-full"
        @submit.prevent="onSubmit"
      >
        <!-- Subject Name -->
        <UFormField required label="Name" name="name">
          <UInput
            v-model="state.name"
            placeholder="e.g. Mathematics"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-book-open" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <!-- Subject Code -->
        <UFormField required label="Code" name="code">
          <UInput v-model="state.code" placeholder="e.g. MATH101" :disabled="isLoading">
            <template #leading>
              <UIcon name="i-lucide-hash" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <!-- Description -->
        <UFormField required label="Description" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Enter description"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-file-text" class="text-muted" />
            </template>
          </UTextarea>
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex space-x-3">
        <u-button
          :icon="SAVE_ICON"
          :loading="isLoading"
          label="Save"
          @click="formRef?.submit()"
        />
        <u-button
          label="Cancel"
          variant="outline"
          color="neutral"
          @click="close"
          :disabled="isLoading"
        />
      </div>
    </template>
  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from "yup";
import type { FormSubmitEvent } from "#ui/types";

const { open, record } = defineProps<{
  open: boolean
  record: Subject | null
}>()

const emit = defineEmits<{
  "update:open": [boolean]
}>()

const store = useSubjectStore();
const { error: toastError, success: toastSuccess } = useNotify();
const isLoading = ref(false);

type SubjectForm = {
  name: string;
  code: string;
  description: string;
};

const state = reactive<SubjectForm>({
  name: "",
  code: "",
  description: "",
});

const schema = yup.object({
  name: yup.string().required("Name is required"),
  code: yup.string().required("Code is required"),
  description: yup.string().required("Description is required"),
});

const formRef = ref<any>(null);

const close = () => {
  emit("update:open", false);
};

const onSubmit = async (event: FormSubmitEvent<SubjectForm>) => {
  event.preventDefault();
  if (!record) return
  isLoading.value = true;

  try {
    await schema.validate(state, { abortEarly: false });
    await store.edit(record.id, {
      name: state.name,
      code: state.code,
      description: state.description,
    });

    await store.fetchAll();
    toastSuccess("Subject edited successfully");
    close();
  } catch (err: any) {
    toastError(err.message);
  } finally {
    isLoading.value = false;
  }
};

watch(() => record, (value) => {
  if (!value) return
  state.name = value.name
  state.code = value.code
  state.description = value.description
}, { immediate: true })
</script>
