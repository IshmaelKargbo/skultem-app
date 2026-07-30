<template>
  <USlideover :dismissible="false" v-model:open="open">
    <UButton
      class="flex justify-center"
      color="info"
      variant="subtle"
      label="Assign Class Master"
      :icon="ASSIGN_ICON"
      @click="open = true"
    />

    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <p class="text-lg font-semibold">Assign Class Master</p>
        <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        :disabled="isLoading"
        class="space-y-4 sm:space-y-5 w-full"
        @submit="onSubmit"
      >
        <!-- Class -->
        <UFormField label="Class" name="classId" required>
          <USelectMenu
            v-model="state.classId"
            value-key="value"
            :items="classes"
            placeholder="Select class"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-school" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">
              Select the class where you want to assign a class master.
            </p>
          </template>
        </UFormField>

        <!-- Section -->
        <UFormField v-if="selectedClass" label="Section" name="sectionId" required>
          <USelectMenu
            v-model="state.sectionId"
            value-key="value"
            :items="sections"
            placeholder="Select section"
            :disabled="isLoading || sections.length === 0"
          >
            <template #leading>
              <UIcon name="i-lucide-layout-grid" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">Choose the section within this class.</p>
          </template>
        </UFormField>

        <!-- Stream -->
        <UFormField
          v-if="selectedClass?.level === Level.SSS"
          label="Stream"
          name="streamId"
          required
        >
          <USelectMenu
            v-model="state.streamId"
            value-key="value"
            :items="streams"
            placeholder="Select stream"
            :disabled="isLoading || streams.length === 0"
          >
            <template #leading>
              <UIcon name="i-lucide-git-branch-plus" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">Select the stream for this SSS class.</p>
          </template>
        </UFormField>

        <!-- Teacher -->
        <UFormField v-if="selectedClass" label="Teacher" name="teacherId" required>
          <USelectMenu
            v-model="state.teacherId"
            value-key="value"
            :items="teachers"
            placeholder="Select teacher"
            :disabled="isLoading || teachers.length === 0"
          >
            <template #leading>
              <UIcon name="i-lucide-user-round" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">
              Select the teacher to assign as the class master.
            </p>
          </template>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row">
        <UButton
          class="justify-center"
          icon="lucide:save"
          :loading="isLoading"
          label="Save"
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
import type { FormSubmitEvent } from "#ui/types";

const store = useClassStore();
const sessionStore = useClassSessionStore();
const teacherStore = useTeacherStore();
const toast = useNotify();

const isLoading = ref(false);
const open = ref(false);
const formRef = ref<any>(null);

const state = reactive({
  classId: "",
  sectionId: "",
  streamId: "",
  teacherId: "",
});

const schema = yup.object({
  classId: yup.string().required("Class is required"),
  sectionId: yup.string().required("Section is required"),
  teacherId: yup.string().required("Teacher is required"),
});

const classes = ref<{ label: string; value: string; stream: string }[]>([]);
const sections = ref<{ label: string; value: string }[]>([]);
const streams = ref<{ label: string; value: string }[]>([]);

const selectedClass = computed(() => {
  if (!state.classId) return null;
  return sessionStore.records.find((c) => c.clazzId === state.classId);
});

const teachers = computed(
  () =>
    teacherStore.records?.map((t) => ({
      label: `${t.user.givenNames} ${t.user.familyName}`,
      value: t.id,
    })) || []
);

// Fetch sections and streams
async function fetchRecords() {
  if (!state.classId) return;

  // Reset dependent fields
  state.sectionId = "";
  state.streamId = "";
  sections.value = [];
  streams.value = [];

  try {
    const resultSections = await store.findAllSections(state.classId);
    sections.value =
      resultSections?.map((s: ClassSection) => ({
        label: s.section.name,
        value: s.section.id,
      })) || [];

    const resultStreams = await store.findAllStreams(state.classId);
    streams.value =
      resultStreams?.map((s: ClassStream) => ({
        label: `${s.stream.name} `,
        value: s.stream.id,
      })) || [];
  } catch (err) {
    sections.value = [];
    streams.value = [];
  }
}

const close = () => {
  open.value = false;
  state.classId = "";
  state.sectionId = "";
  state.streamId = "";
  state.teacherId = "";
  sections.value = [];
  streams.value = [];
};

const onSubmit = async (event: FormSubmitEvent<typeof state>) => {
  isLoading.value = true;
  try {
    const clazz = classes.value.find((e) => e.value == state.classId);

    if (clazz) {
      await store.assignClassMaster(state.classId, {
        sectionId: state.sectionId,
        streamId: clazz.stream || "",
        teacherId: state.teacherId,
      });

      toast.success("The class master has been assigned successfully.");
      close();
      sessionStore.fetchAll();
    }
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    isLoading.value = false;
  }
};

watch(open, async (val) => {
  if (val) {
    const res = await sessionStore.fetchAllUnassign(0, 0);
    if (res == null) return;
    classes.value = res.map((c: ClassSession) => {
      let name = c.clazz;

      if (c.streamName != "N/A") {
        name = `${c.clazz} (${c.streamName})`;
      }

      return {
        label: name,
        value: c.clazzId,
        stream: c.streamId,
      };
    });
    await teacherStore.fetchAll(0, 0);
  }
});

watch(
  () => state.classId,
  () => {
    fetchRecords();
  }
);
</script>
