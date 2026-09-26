<template>
  <USlideover :dismissible="false" :open="open" @update:open="open = $event">
    <UButton
      color="primary"
      class="hidden md:flex justify-center"
      label="Add Class"
      :icon="ADD_ICON"
      @click="open = true"
    />
     <UButton
      color="primary"
      class="md:hidden"
      :icon="ADD_ICON"
      @click="open = true"
    />

    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <p class="text-lg font-semibold">Add Class</p>
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
          <UInput v-model="state.name" placeholder="e.g. Class 1" :disabled="isLoading">
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

        <!-- Level -->
        <UFormField required label="Level" name="level">
          <USelectMenu
            v-model="state.level"
            value-key="value"
            :items="myLevelOptions"
            placeholder="Select class level"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-layers-3" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">
              {{ scopeHelp }}
            </p>
          </template>
        </UFormField>

        <!-- Stream -->
        <UFormField
          v-if="isStreamed"
          required
          label="Stream"
          name="streams"
        >
          <USelectMenu
            v-model="state.streams"
            value-key="value"
            :items="streams"
            multiple
            placeholder="Select stream"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-git-branch-plus" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">Assign one or more streams for SSS classes.</p>
          </template>
        </UFormField>

        <!-- Streamed levels: each stream picks its own sections (Art -> A and B, Science -> A only). -->
        <div v-if="isStreamed && state.streams.length" class="space-y-3">
          <p class="text-sm font-medium text-highlighted">Sections for each stream</p>
          <UFormField v-for="streamId in state.streams" :key="streamId" required :label="streamName(streamId)"
            :name="`streamSections.${streamId}`"
            :error="showErrors && !(state.streamSections[streamId]?.length) ? 'Pick at least one section' : undefined">
            <USelectMenu v-model="state.streamSections[streamId]" value-key="value" :items="sections" multiple
              :placeholder="`Sections that run ${streamName(streamId)}`" :disabled="isLoading">
              <template #leading>
                <UIcon name="i-lucide-layout-grid" class="text-muted" />
              </template>
            </USelectMenu>
          </UFormField>
          <p class="text-xs text-muted">
            Streams don't have to share sections - e.g. Art can run sections A and B while Science only runs A.
            You can add or remove one later.
          </p>
        </div>

        <!-- Sections -->
        <UFormField v-if="!isStreamed" required label="Sections" name="sections">
          <USelectMenu
            v-model="state.sections"
            value-key="value"
            :items="sections"
            multiple
            placeholder="Select sections"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-layout-grid" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">Select one or more sections for this class.</p>
          </template>
        </UFormField>

        <!-- Assessment Template -->
        <UFormField label="Assessment Template" name="assessmentTemplateId">
          <USelectMenu
            v-model="state.assessmentTemplateId"
            value-key="value"
            :items="assessmentTemplates"
            placeholder="Select assessment template (optional)"
            :disabled="isLoading || assessmentStore.loading"
          >
            <template #leading>
              <UIcon name="i-lucide-clipboard-list" class="text-muted" />
            </template>
          </USelectMenu>

          <template #help>
            <p class="text-xs text-muted">
              Optional. Used when creating assessments for this class.
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
import { reactive, ref, computed, watch, onMounted } from "vue";
import type { FormSubmitEvent } from "#ui/types";

const store = useClassStore();
const streamStore = useStreamStore();
const sectionStore = useSectionStore();
const assessmentStore = useAssessmentStore();
const { error: toastError, success: toastSuccess } = useNotify();

const open = ref(false);
const isLoading = ref(false);
const formRef = ref<any>(null);

const streams = computed(() =>
  streamStore.records.map((s) => ({
    label: s.name,
    value: s.id,
  }))
);

const sections = computed(() =>
  sectionStore.records.map((s) => ({
    label: s.name,
    value: s.id,
  }))
);

const assessmentTemplates = computed(() =>
  assessmentStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

const { levelOptions, load: loadStructure } = useSchoolStructure();

// A scoped Admin (limited to one management section, e.g. Secondary) should only be offered the
// levels they can actually create classes in - the backend rejects anything outside their scope
// (see SectionScopeGuard#level) - not every level the whole school offers.
const { scope: myScope, load: loadMyScope, restrict } = useMyScope();
const myLevelOptions = computed(() => restrict(levelOptions.value));

const scopeHelp = computed(() => {
  if (myScope.value && !myScope.value.wholeSchool) {
    return `You can only create classes in your section (${myScope.value.sectionNames.join(', ')}).`;
  }
  return "Select the education level for this class. Only the levels your school offers are listed (Settings > School Structure).";
});

type ClassForm = {
  name: string;
  level: string;
  sections: string[];
  streams: string[];
  // Streamed levels: the sections each chosen stream runs.
  streamSections: Record<string, string[]>;
  assessmentTemplateId: string;
};

const state = reactive<ClassForm>({
  name: "",
  level: "",
  sections: [],
  streams: [],
  streamSections: {},
  assessmentTemplateId: "",
});

const showErrors = ref(false);
const streamName = (id: string) => streams.value.find((s) => s.value === id)?.label || "Stream";

const isStreamed = computed(() => !!levelInfo(state.level)?.streamed);

const schema = yup.object({
  name: yup.string().required("Name is required"),
  level: yup.string().required("Level is required"),
  sections: yup.array().when("level", {
    is: (level: string) => !!levelInfo(level)?.streamed,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.of(yup.string()).min(1, "At least one section is required"),
  }),
  streams: yup.array().when("level", {
    is: (level: string) => !!levelInfo(level)?.streamed,
    then: (schema) =>
      schema.of(yup.string()).min(1, "At least one stream is required for this level"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

watch(
  () => state.level,
  (val) => {
    if (!levelInfo(val)?.streamed) {
      state.streams = [];
      state.streamSections = {};
    }
  }
);

// A newly picked stream starts with the sections another chosen stream already runs (the common case
// is the same sections for every stream); dropped streams lose theirs.
watch(
  () => [...state.streams],
  (now) => {
    const next: Record<string, string[]> = {};
    const template = now.map((id) => state.streamSections[id]).find((s) => s?.length) ?? [];
    for (const id of now) next[id] = state.streamSections[id] ?? [...template];
    state.streamSections = next;
  }
);

const close = () => {
  open.value = false;
  state.name = "";
  state.level = "";
  state.sections = [];
  state.streams = [];
  state.streamSections = {};
  state.assessmentTemplateId = "";
  showErrors.value = false;
};

const onSubmit = async (event: FormSubmitEvent<ClassForm>) => {
  if (isStreamed.value && state.streams.some((id) => !state.streamSections[id]?.length)) {
    showErrors.value = true;
    return;
  }

  isLoading.value = true;
  try {
    const perStream = isStreamed.value
      ? state.streams.map((id) => ({ streamId: id, sectionIds: state.streamSections[id] ?? [] }))
      : undefined;
    await store.create({
      name: state.name,
      level: state.level as LevelCode,
      // A streamed class's sections come from its streams above.
      sections: perStream ? [...new Set(perStream.flatMap((p) => p.sectionIds))] : state.sections,
      streams: state.streams,
      streamSections: perStream,
      assessmentTemplateId: state.assessmentTemplateId || undefined,
    });
    toastSuccess("Class created successfully");
    await useClassSessionStore().fetchAll(1, runtimeConf().limit);
    close();
  } catch (err: any) {
    toastError(err?.message || "Something went wrong");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStructure();
  loadMyScope();
  streamStore.fetchAll();
  sectionStore.fetchAll();
  assessmentStore.fetchAll(1, 0);
});
</script>
