<template>
  <div class="space-y-6 px-4 md:px-6">
    <Heading title="Academic Calendar"
      subtitle="Sierra Leone's current academic year and the terms the ministry provides. Every newly onboarded school starts from this." />

    <UAlert v-if="!loading && !calendar" color="warning" variant="soft" icon="i-lucide-triangle-alert"
      title="No calendar configured yet"
      description="Until you save one, new schools are created without an academic year or terms and have to set them up by hand." />

    <UAlert v-else-if="calendar" color="info" variant="soft" icon="i-lucide-info"
      :title="`Current: ${calendar.name}`"
      description="Saving changes only affects schools onboarded afterwards - schools that already exist keep their own calendar." />

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-calendar-range" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">Academic Year</p>
              <p class="text-sm text-muted hidden md:block">
                Saving a new name makes it the current year; saving the same name edits it.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-3">
          <UFormField label="Name" name="name" required>
            <UInput v-model="state.name" placeholder="e.g. 2025/2026" class="w-full" :disabled="saving" />
          </UFormField>

          <UFormField label="Start Date" name="startDate" required>
            <UInput v-model="state.startDate" type="date" class="w-full" :disabled="saving" />
          </UFormField>

          <UFormField label="End Date" name="endDate" required>
            <UInput v-model="state.endDate" type="date" class="w-full" :disabled="saving" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-layers" class="text-primary text-2xl" />
              <div>
                <p class="font-semibold">Terms</p>
                <p class="text-sm text-muted hidden md:block">
                  In order, inside the academic year, without overlapping. Maximum {{ MAX_TERMS }}.
                </p>
              </div>
            </div>

            <UButton label="Add Term" icon="i-lucide-plus" color="neutral" variant="outline" size="sm"
              :disabled="saving || state.terms.length >= MAX_TERMS" @click="addTerm" />
          </div>
        </template>

        <div class="space-y-4">
          <div v-for="(term, index) in state.terms" :key="index"
            class="grid items-end gap-4 rounded-xl border border-default p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <UFormField :label="`Term ${index + 1} Name`" :name="`terms.${index}.name`" required>
              <UInput v-model="term.name" placeholder="e.g. First Term" class="w-full" :disabled="saving" />
            </UFormField>

            <UFormField label="Start Date" :name="`terms.${index}.startDate`" required>
              <UInput v-model="term.startDate" type="date" class="w-full" :disabled="saving" />
            </UFormField>

            <UFormField label="End Date" :name="`terms.${index}.endDate`" required>
              <UInput v-model="term.endDate" type="date" class="w-full" :disabled="saving" />
            </UFormField>

            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Remove term"
              :disabled="saving || state.terms.length <= 1" @click="removeTerm(index)" />
          </div>
        </div>

        <template #footer>
          <p class="text-xs text-muted">
            A new school gets the term running today activated (which also sets up its platform fee), terms that already
            ended closed, and the rest upcoming.
          </p>
        </template>
      </UCard>

      <div class="flex justify-end gap-3">
        <UButton label="Reset" color="neutral" variant="outline" :disabled="saving" @click="fillFromCalendar" />
        <UButton type="submit" :loading="saving" icon="i-lucide-save" label="Save Calendar" />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";

const MAX_TERMS = 3;

const store = usePlatformStore();
const { calendar, calendarLoading: loading } = storeToRefs(store);
const { success: toastSuccess, error: toastError } = useNotify();

const saving = ref(false);

// Not named `number`: Nuxt's export scanner lists a bogus `number` export for utils/common.ts, so a
// bare identifier with that name gets a nonexistent auto-import injected and breaks the app's load.
function emptyTerm(position: number) {
  return { name: `Term ${position}`, startDate: "", endDate: "" };
}

const state = reactive({
  name: "",
  startDate: "",
  endDate: "",
  terms: [emptyTerm(1), emptyTerm(2), emptyTerm(3)],
});

const schema = yup.object({
  name: yup.string().trim().required("Academic year name is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test("after-start", "End date must be after the start date", (v) => !v || !state.startDate || v > state.startDate),
  terms: yup
    .array()
    .of(
      yup.object({
        name: yup.string().trim().required("Term name is required"),
        startDate: yup.string().required("Start date is required"),
        endDate: yup.string().required("End date is required"),
      }),
    )
    .min(1, "Add at least one term")
    .max(MAX_TERMS)
    .test("valid-terms", (terms, ctx) => {
      // Same rules the backend enforces (SaveNationalCalendarUseCase) so mistakes show up here first.
      let previousEnd = "";
      for (let i = 0; i < (terms?.length ?? 0); i++) {
        const t = terms![i]!;
        if (!t.startDate || !t.endDate) continue;
        const n = i + 1;
        if (t.startDate >= t.endDate) return ctx.createError({ message: `Term ${n} must start before it ends` });
        if (state.startDate && t.startDate < state.startDate || state.endDate && t.endDate > state.endDate)
          return ctx.createError({ message: `Term ${n} must fall within the academic year` });
        if (previousEnd && t.startDate <= previousEnd)
          return ctx.createError({ message: `Term ${n} must start after Term ${n - 1} ends` });
        previousEnd = t.endDate;
      }
      return true;
    }),
});

function addTerm() {
  if (state.terms.length < MAX_TERMS) state.terms.push(emptyTerm(state.terms.length + 1));
}

function removeTerm(index: number) {
  if (state.terms.length > 1) state.terms.splice(index, 1);
}

// Loads the saved calendar into the form (or clears it if none exists yet) - also what "Reset" does.
function fillFromCalendar() {
  const c = calendar.value;
  if (!c) return;

  state.name = c.name;
  state.startDate = c.startDate;
  state.endDate = c.endDate;
  state.terms = c.terms.map((t) => ({ name: t.name, startDate: t.startDate, endDate: t.endDate }));
}

async function onSubmit() {
  try {
    saving.value = true;

    const saved = await store.saveCalendar({
      name: state.name.trim(),
      startDate: state.startDate,
      endDate: state.endDate,
      terms: state.terms.map((t) => ({ name: t.name.trim(), startDate: t.startDate, endDate: t.endDate })),
    });

    if (!saved) return;

    toastSuccess(`${saved.name} saved - new schools will start from it`);
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  useAppStore().setTitle("System Admin · Academic Calendar");
  useAppStore().setBack(false);
  document.title = "Academic Calendar | System Admin | Skultem";

  await store.fetchCalendar();
  fillFromCalendar();
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN],
});
</script>
