<template>
  <div class="space-y-5 px-4 md:px-6">
    <UAlert v-if="!loading && !calendar" color="warning" variant="soft" icon="i-lucide-triangle-alert"
      title="No calendar configured yet"
      description="Until you save one, new schools are created without an academic year or terms and have to set them up by hand." />

    <UForm :schema="schema" :state="state" class="grid items-start gap-5 lg:grid-cols-3" @submit="onSubmit">
      <div class="space-y-5 lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-8 items-center justify-center rounded-lg bg-elevated text-muted">
                <UIcon name="i-lucide-calendar-range" class="size-4" />
              </span>
              <div>
                <p class="font-semibold">Academic year</p>
                <p class="hidden text-sm text-muted md:block">Saving a new name makes it the current year; saving the
                  same name edits it.</p>
              </div>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-3">
            <UFormField label="Name" name="name" required>
              <UInput v-model="state.name" placeholder="e.g. 2025/2026" class="w-full" :disabled="saving" />
            </UFormField>
            <UFormField label="Start date" name="startDate" required>
              <UInput v-model="state.startDate" type="date" class="w-full" :disabled="saving" />
            </UFormField>
            <UFormField label="End date" name="endDate" required>
              <UInput v-model="state.endDate" type="date" class="w-full" :disabled="saving"
                :min="state.startDate || undefined" />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="flex size-8 items-center justify-center rounded-lg bg-elevated text-muted">
                  <UIcon name="i-lucide-layers" class="size-4" />
                </span>
                <div>
                  <p class="font-semibold">Terms</p>
                  <p class="hidden text-sm text-muted md:block">In order, inside the academic year, without overlapping.
                    Up to {{ MAX_TERMS }}.</p>
                </div>
              </div>
              <UButton label="Add term" icon="i-lucide-plus" color="neutral" variant="outline" size="sm"
                :disabled="saving || state.terms.length >= MAX_TERMS" @click="addTerm" />
            </div>
          </template>

          <div class="space-y-4">
            <div v-for="(term, index) in state.terms" :key="index" class="rounded-xl border border-default p-4">
              <div class="mb-3 flex items-center justify-between">
                <p class="flex items-center gap-2 text-sm font-semibold text-highlighted">
                  <span class="flex size-6 items-center justify-center rounded-full bg-elevated text-xs text-toned">{{
                    index + 1
                  }}</span>
                  {{ term.name || `Term ${index + 1}` }}
                </p>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" aria-label="Remove term"
                  :disabled="saving || state.terms.length <= 1" @click="removeTerm(index)" />
              </div>
              <div class="grid gap-4 md:grid-cols-3">
                <UFormField label="Name" :name="`terms.${index}.name`" required>
                  <UInput v-model="term.name" placeholder="e.g. First Term" class="w-full" :disabled="saving" />
                </UFormField>
                <UFormField label="Start date" :name="`terms.${index}.startDate`" required>
                  <UInput v-model="term.startDate" type="date" class="w-full" :disabled="saving" :min="termMin(index)"
                    :max="term.endDate || state.endDate || undefined" @change="clampTerm(term)" />
                </UFormField>
                <UFormField label="End date" :name="`terms.${index}.endDate`" required>
                  <UInput v-model="term.endDate" type="date" class="w-full" :disabled="saving"
                    :min="term.startDate || termMin(index)" :max="state.endDate || undefined"
                    @change="clampTerm(term)" />
                </UFormField>
              </div>
            </div>
          </div>

          <template #footer>
            <p class="text-xs text-muted">
              A new school gets the term running today activated (which also sets up its platform fee), terms that
              already
              ended closed, and the rest upcoming.
            </p>
          </template>
        </UCard>
      </div>

      <!-- Preview -->
      <aside class="space-y-5 lg:sticky lg:top-4">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold text-highlighted">Year at a glance</h3>
              <UBadge v-if="calendar" size="sm" variant="subtle" color="neutral" :label="`Saved: ${calendar.name}`" />
            </div>
          </template>

          <p v-if="!timeline" class="py-6 text-center text-sm text-muted">Enter the year's start and end dates to see it
            laid
            out.</p>

          <div v-else class="space-y-5">
            <div>
              <div class="flex justify-between text-xs text-muted"><span>{{ fmt(state.startDate) }}</span><span>{{
                fmt(state.endDate) }}</span></div>
              <div class="relative mt-1.5 h-8 overflow-hidden rounded-lg bg-elevated">
                <div v-for="t in timeline.terms.filter(x => x.ok)" :key="t.key"
                  class="absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-md bg-primary text-[11px] font-medium text-white"
                  :style="{ left: `${t.left}%`, width: `${t.width}%` }" :title="t.name">{{ t.key + 1 }}</div>
              </div>
              <p class="mt-1.5 text-xs text-muted">{{ timeline.teachingWeeks }} of {{ timeline.totalWeeks }} weeks are
                in
                term. The gaps are the breaks.</p>
            </div>

            <ul class="space-y-3">
              <li v-for="t in timeline.terms" :key="t.key" class="text-sm">
                <p v-if="t.gapDays > 0" class="mb-2 flex items-center gap-1.5 text-xs text-muted">
                  <UIcon name="i-lucide-sun" class="size-3.5" />{{ t.gapDays }} day{{ t.gapDays === 1 ? '' : 's' }}
                  break
                </p>
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-highlighted">{{ t.name }}</p>
                    <p class="text-xs text-muted">{{ fmt(state.terms[t.key]!.startDate) }} – {{
                      fmt(state.terms[t.key]!.endDate) }}</p>
                  </div>
                  <UBadge v-if="t.ok" size="sm" variant="subtle" color="neutral" :label="`${t.weeks} wk`" />
                  <UBadge v-else-if="state.terms[t.key]!.startDate && state.terms[t.key]!.endDate" size="sm"
                    variant="subtle" color="warning" label="Check dates" />
                </div>
              </li>
            </ul>
          </div>

          <template v-if="calendar?.updatedAt" #footer>
            <p class="text-xs text-muted">Last saved {{ formatDateTime(calendar.updatedAt) }}</p>
          </template>
        </UCard>

        <UCard :ui="{body: 'p-3 md:p-3'}">
          <div class="flex justify-end gap-3">
            <UButton label="Reset" color="neutral" variant="outline" :disabled="saving" @click="fillFromCalendar" />
            <UButton type="submit" :loading="saving" icon="i-lucide-save" label="Save calendar" />
          </div>
        </UCard>
      </aside>
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

// ---- A picture of the year, from what is typed in ----
const DAY = 86400000;
const toMs = (d: string) => (d ? Date.parse(`${d}T00:00:00Z`) : NaN);
const fmt = (d: string) => (d ? formatDate(d) : "—");

const timeline = computed(() => {
  const start = toMs(state.startDate);
  const end = toMs(state.endDate);
  if (!(end > start)) return null;
  const span = end - start;
  const terms = state.terms.map((t, i) => {
    const ts = toMs(t.startDate);
    const te = toMs(t.endDate);
    const ok = te > ts && ts >= start && te <= end;
    return {
      key: i,
      name: t.name || `Term ${i + 1}`,
      ok,
      left: ok ? ((ts - start) / span) * 100 : 0,
      width: ok ? ((te - ts) / span) * 100 : 0,
      weeks: te > ts ? Math.round((te - ts) / DAY / 7) : 0,
      // Days between the end of the term before and the start of this one.
      gapDays: i > 0 && ts > toMs(state.terms[i - 1]!.endDate) ? Math.round((ts - toMs(state.terms[i - 1]!.endDate)) / DAY) - 1 : 0,
    };
  });
  return { terms, totalWeeks: Math.round(span / DAY / 7), teachingWeeks: terms.reduce((n, t) => n + (t.ok ? t.weeks : 0), 0) };
});

// A name suggestion for a year that has none yet, e.g. 2025/2026.
watch(() => [state.startDate, state.endDate], ([a, b]) => {
  if (state.name || !a || !b) return;
  const y1 = a.slice(0, 4), y2 = b.slice(0, 4);
  if (y1 && y2 && y1 !== y2) state.name = `${y1}/${y2}`;
});

// The earliest a term can start: the year's start, or the day after the term before it ends.
function termMin(index: number) {
  const previousEnd = index > 0 ? state.terms[index - 1]?.endDate : "";
  if (previousEnd) {
    const next = new Date(toMs(previousEnd) + DAY).toISOString().slice(0, 10);
    return state.startDate && state.startDate > next ? state.startDate : next;
  }
  return state.startDate || undefined;
}

// Typing can get past a date picker's limits, so a date outside the year is pulled back to its edge when the
// field is left. (A term that is still wrong afterwards - overlapping, say - is reported by the form.)
function clampTerm(term: { startDate: string, endDate: string }) {
  const lo = state.startDate, hi = state.endDate;
  for (const key of ["startDate", "endDate"] as const) {
    if (!term[key]) continue;
    if (lo && term[key] < lo) term[key] = lo;
    if (hi && term[key] > hi) term[key] = hi;
  }
}

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
