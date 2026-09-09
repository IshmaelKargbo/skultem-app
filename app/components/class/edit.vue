<template>
  <USlideover :dismissible="false" :open="open" @update:open="open = $event">
    <UButton
      color="neutral"
      variant="soft"
      size="sm"
      label="Edit"
      :icon="EDIT_ICON"
      @click="openEdit"
    />

    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <p class="text-lg font-semibold">Edit Class</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-5"
        @submit.prevent="onSubmit"
      >
        <!-- Name -->
        <UFormField required label="Name" name="name">
          <UInput v-model="state.name" placeholder="e.g. Class 1" :disabled="isLoading || isFetching">
            <template #leading>
              <UIcon name="i-lucide-school" class="text-muted" />
            </template>
          </UInput>

          <template #help>
            <p class="text-xs text-muted">
              Enter the name of the class. This will be used for display and
              identification.
            </p>
          </template>
        </UFormField>

        <!-- Grade -->
        <UFormField required label="Grade" name="levelOrder">
          <UInput
            v-model="state.levelOrder"
            type="number"
            placeholder="e.g. 1"
            :disabled="isLoading || isFetching"
          >
            <template #leading>
              <UIcon name="i-lucide-hash" class="text-muted" />
            </template>
          </UInput>

          <template #help>
            <p class="text-xs text-muted">Lower numbers appear first in class lists.</p>
          </template>
        </UFormField>

        <!-- Assessment Template -->
        <UFormField label="Assessment Template" name="assessmentTemplateId">
          <USelectMenu
            v-model="state.assessmentTemplateId"
            value-key="value"
            :items="assessmentTemplates"
            placeholder="Select assessment template (optional)"
            :disabled="isLoading || isFetching || assessmentStore.loading"
          >
            <template #leading>
              <UIcon name="i-lucide-clipboard-list" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">
              Used when creating assessments for this class.
            </p>
          </template>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-3 sm:flex-row">
        <UButton
          class="justify-center"
          :icon="SAVE_ICON"
          label="Save"
          :loading="isLoading"
          :disabled="isFetching"
          @click="formRef?.submit()"
        />
        <UButton
          class="justify-center"
          label="Cancel"
          variant="outline"
          color="neutral"
          @click="close"
          :disabled="isLoading"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { reactive, ref, computed, onMounted } from "vue";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{ classId: string }>();
const emit = defineEmits<{ updated: [] }>();

const store = useClassStore();
const assessmentStore = useAssessmentStore();
const { error: toastError, success: toastSuccess } = useNotify();

const open = ref(false);
const isLoading = ref(false);
const isFetching = ref(false);
const formRef = ref<any>(null);

const assessmentTemplates = computed(() =>
  assessmentStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

type ClassEditForm = {
  name: string;
  levelOrder: number | null;
  assessmentTemplateId: string;
};

const state = reactive<ClassEditForm>({
  name: "",
  levelOrder: null,
  assessmentTemplateId: "",
});

// Tracked separately from state.assessmentTemplateId so onSubmit only calls the
// template endpoint when the user actually changed it - that endpoint 400s if
// grading has already started for the class, so it shouldn't fire on every save.
const originalTemplateId = ref("");

const schema = yup.object({
  name: yup.string().required("Name is required"),
  levelOrder: yup
    .number()
    .typeError("Grade must be a number")
    .required("Grade is required")
    .min(1),
});

const close = () => {
  open.value = false;
};

const openEdit = async () => {
  open.value = true;
  isFetching.value = true;
  try {
    const record = await store.findOne(props.classId);
    state.name = record?.name ?? "";
    state.levelOrder = record?.levelOrder ?? null;
    state.assessmentTemplateId = record?.assessmentTemplateId ?? "";
    originalTemplateId.value = state.assessmentTemplateId;
  } catch (err: any) {
    toastError(err?.message || "Failed to load class");
  } finally {
    isFetching.value = false;
  }
};

const onSubmit = async (event: FormSubmitEvent<ClassEditForm>) => {
  isLoading.value = true;
  try {
    await store.update(props.classId, {
      name: state.name,
      levelOrder: state.levelOrder as number,
    });

    if (state.assessmentTemplateId && state.assessmentTemplateId !== originalTemplateId.value) {
      await store.updateTemplate(props.classId, state.assessmentTemplateId);
    }

    toastSuccess("Class updated successfully");
    emit("updated");
    close();
  } catch (err: any) {
    toastError(err?.message || "Something went wrong");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  assessmentStore.fetchAll(1, 0);
});
</script>
