<template>
  <div class="px-4 md:px-6">
    <Heading title="Onboard a school" subtitle="Set up the school, its levels and its owner. The owner is emailed their login details." />

    <UForm :schema="schema" :state="state" class="mt-4 grid items-start gap-6 lg:grid-cols-3" @submit="onSubmit">
      <div class="space-y-6 lg:col-span-2">

        <!-- School -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-8 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-school" class="size-4" /></span>
              <div>
                <p class="font-semibold">School</p>
                <p class="hidden text-sm text-muted md:block">The school's name and login address.</p>
              </div>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="School name" name="name" required class="md:col-span-2">
              <UInput v-model="state.name" placeholder="e.g. King's Way International School" class="w-full"
                :disabled="loading" />
            </UFormField>

            <UFormField label="Domain" name="domain" required class="md:col-span-2"
              help="Staff, parents and students sign in at this address. Suggested from the name - change it if you like.">
              <UInput :model-value="state.domain" placeholder="kingsway" class="w-full" :disabled="loading"
                :ui="{ trailing: 'pe-3' }" @update:model-value="onDomainInput">
                <template #trailing><span class="text-sm text-muted">.skultem.space</span></template>
              </UInput>
            </UFormField>
          </div>
        </UCard>

        <!-- Address -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-8 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-map-pin" class="size-4" /></span>
              <div>
                <p class="font-semibold">Location</p>
                <p class="hidden text-sm text-muted md:block">Where the school is. Pick the region first - district and chiefdom follow it.</p>
              </div>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Street" name="street" required>
              <UInput v-model="state.street" placeholder="e.g. 12 Wilkinson Road" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="City" name="city" required>
              <UInput v-model="state.city" placeholder="e.g. Freetown" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Region" name="region" required>
              <USelectMenu v-model="state.region" value-key="value" :items="regionOptions" placeholder="Select region"
                class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="District" name="district" required>
              <USelectMenu v-model="state.district" value-key="value" :items="districtOptions(state.region)"
                :placeholder="state.region ? 'Select district' : 'Select a region first'" class="w-full"
                :disabled="loading || !state.region" />
            </UFormField>

            <UFormField label="Chiefdom" name="chiefdom" required class="md:col-span-2">
              <USelectMenu v-model="state.chiefdom" value-key="value" :items="chiefdomOptions(state.district)"
                :placeholder="state.district ? 'Select chiefdom' : 'Select a district first'" class="w-full"
                :disabled="loading || !state.district" />
            </UFormField>
          </div>
        </UCard>

        <!-- Levels + management structure -->
        <div ref="structureEl" class="scroll-mt-4">
          <SettingsSchoolStructureEditor v-model="structure" :readonly="loading" :show-errors="showStructureErrors" />
        </div>

        <!-- Owner -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-8 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-user" class="size-4" /></span>
              <div>
                <p class="font-semibold">Owner</p>
                <p class="hidden text-sm text-muted md:block">The person who runs the school on Skultem. They get the OWNER role.</p>
              </div>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Given names" name="givenNames" required>
              <UInput v-model="state.givenNames" placeholder="e.g. Ishmael" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Family name" name="familyName" required>
              <UInput v-model="state.familyName" placeholder="e.g. Kargbo" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput v-model="state.email" type="email" icon="i-lucide-mail" placeholder="owner@example.com"
                class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Phone" name="phone" required>
              <UInput v-model="state.phone" icon="i-lucide-phone" placeholder="+232..." class="w-full" :disabled="loading" />
            </UFormField>
          </div>
        </UCard>

        <div class="flex justify-end gap-3 lg:hidden">
          <UButton label="Cancel" color="neutral" variant="outline" to="/schools" />
          <UButton type="submit" :loading="loading" icon="i-lucide-plus" label="Onboard school" />
        </div>
      </div>

      <!-- Summary -->
      <aside class="space-y-4 lg:sticky lg:top-4">
        <UCard>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-sm">
                <p class="font-semibold text-highlighted">Ready to onboard</p>
                <span class="text-muted">{{ progress }}%</span>
              </div>
              <UProgress class="mt-2" :model-value="progress" size="sm" />
            </div>

            <div class="rounded-xl bg-elevated p-3">
              <p class="truncate text-sm font-semibold text-highlighted">{{ state.name || 'New school' }}</p>
              <p class="truncate text-xs text-muted">{{ state.domain || 'domain' }}.skultem.space</p>
              <p v-if="state.district" class="mt-1 truncate text-xs text-muted">
                {{ [state.chiefdom, state.district, state.region].filter(Boolean).join(', ') }}
              </p>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">What happens next</p>
              <ul class="mt-2 space-y-2.5 text-sm">
                <li class="flex gap-2.5"><UIcon name="i-lucide-mail" class="mt-0.5 size-4 shrink-0 text-muted" />
                  <span>{{ state.email || 'The owner' }} is emailed a login link and a temporary password.</span></li>
                <li class="flex gap-2.5"><UIcon name="i-lucide-hand-coins" class="mt-0.5 size-4 shrink-0 text-muted" />
                  <span v-if="fee">The platform fee is set up for you: {{ format(fee.perYear) }} per student per year ({{ format(fee.perTerm) }} × {{ fee.termsPerYear }} terms).</span>
                  <span v-else>The platform fee is set up for you automatically.</span></li>
                <li class="flex gap-2.5"><UIcon name="i-lucide-calendar-days" class="mt-0.5 size-4 shrink-0 text-muted" />
                  <span>The academic calendar is created from the national one.</span></li>
              </ul>
            </div>

            <div class="flex flex-col gap-2 border-t border-default pt-4">
              <UButton type="submit" block size="lg" :loading="loading" icon="i-lucide-plus" label="Onboard school" class="hidden lg:flex" />
              <UButton label="Cancel" color="neutral" variant="ghost" block to="/schools" class="hidden lg:flex" />
            </div>
          </div>
        </UCard>
      </aside>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";

const store = useSystemStore();
const { error: toastError, success: toastSuccess } = useNotify();
const { regionOptions, districtOptions, chiefdomOptions } = useRdcsl();

const loading = ref(false);

// Levels offered + how they're managed. No levels pre-ticked - the school has to say what it runs.
const structure = ref<SchoolStructureDraft>({ managementModel: "UNIFIED", levels: [], sections: [] });
const showStructureErrors = ref(false);
const structureEl = ref<HTMLElement | null>(null);

const state = reactive({
  name: "",
  domain: "",
  street: "",
  city: "",
  region: "",
  district: "",
  chiefdom: "",
  givenNames: "",
  familyName: "",
  email: "",
  phone: "",
});

const schema = yup.object({
  name: yup.string().min(3, "School name must be at least 3 characters").required("School name is required"),
  domain: yup.string().matches(/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/, "Use 3-40 lowercase letters, numbers or hyphens").required("Domain is required"),
  street: yup.string().min(5, "Street must be at least 5 characters").required("Street is required"),
  city: yup.string().required("City is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  chiefdom: yup.string().required("Chiefdom is required"),
  givenNames: yup.string().min(2, "Given names must be at least 2 characters").required("Owner given names are required"),
  familyName: yup.string().min(2, "Family name must be at least 2 characters").required("Owner family name is required"),
  email: yup.string().email("Invalid email format").required("Owner email is required"),
  phone: yup.string().matches(/^[0-9+]{7,15}$/, "Enter a valid phone number").required("Owner phone is required"),
});

// A district only makes sense within its region - dropping a previously chosen one whenever the
// region changes rather than leaving a mismatched region/district pair to slip through.
watch(() => state.region, () => {
  state.district = "";
});

// ...and a chiefdom within its district.
watch(() => state.district, () => {
  state.chiefdom = "";
});

// The domain follows the school's name until someone types their own.
const slugify = (value: string) =>
  value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
const domainEdited = ref(false);
watch(() => state.name, (name) => {
  if (!domainEdited.value) state.domain = slugify(name);
});
function onDomainInput(value: string) {
  domainEdited.value = true;
  state.domain = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// What every student will be charged, so whoever onboards a school knows what it starts on.
const fee = ref<PlatformFeeOverview>();
const { format } = useMoney();
onMounted(async () => {
  fee.value = await PlatformApi().platformFee().catch(() => undefined);
});

const progress = computed(() => {
  const parts = [state.name, state.domain, state.street, state.city, state.region, state.district, state.chiefdom,
    state.givenNames, state.familyName, state.email, state.phone, structure.value.levels.length ? "x" : ""];
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
});

// The backend generates and emails the owner their real login password itself once the school is
// created (see CreateSchoolUseCase) - this is only here to satisfy CreateSchoolDTO's validation,
// never seen or used by anyone.
function randomPassword() {
  return `Sk${Math.random().toString(36).slice(2, 10)}${Math.floor(Math.random() * 10)}!`;
}

async function onSubmit() {
  if (validateSchoolStructure(structure.value).length) {
    showStructureErrors.value = true;
    structureEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    toastError("Finish setting up the school's levels and management structure");
    return;
  }

  try {
    loading.value = true;

    const school = await store.createSchool({
      name: state.name,
      domain: state.domain,
      street: state.street,
      city: state.city,
      region: state.region,
      district: state.district,
      chiefdom: state.chiefdom,
      givenNames: state.givenNames,
      familyName: state.familyName,
      email: state.email,
      phone: state.phone,
      password: randomPassword(),
      structure: draftToPayload(structure.value),
    });

    if (!school) return;

    toastSuccess(`${clean(state.name)} onboarded - login details emailed to ${state.email}`);
    await navigateTo("/schools");
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  useAppStore().setTitle("System Admin · Onboard School");
  useAppStore().setBack('/schools');
  document.title = "Onboard School | System Admin | Skultem";
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN],
});
</script>
