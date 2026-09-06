<template>
  <div class="space-y-6 px-4 md:px-6">
    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">

      <!-- School -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon :name="SCHOOL_ICON" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">School</p>
              <p class="text-sm text-muted hidden md:block">The school's name and login domain.</p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">
          <UFormField label="School Name" name="name" required>
            <UInput v-model="state.name" placeholder="e.g. King's Way International School" class="w-full"
              :disabled="loading" />
          </UFormField>

          <UFormField label="Domain" name="domain" required help="Used for the school's login link">
            <UInput v-model="state.domain" placeholder="e.g. kingsway" class="w-full" :disabled="loading" />
          </UFormField>
        </div>
      </UCard>

      <!-- Address -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-map-pin" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">Address</p>
              <p class="text-sm text-muted hidden md:block">Where the school is located.</p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">
          <UFormField label="Street" name="street" required class="md:col-span-2">
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

          <UFormField label="Chiefdom" name="chiefdom" required>
            <UInput v-model="state.chiefdom" placeholder="e.g. Freetown Municipality" class="w-full"
              :disabled="loading" />
          </UFormField>
        </div>
      </UCard>

      <!-- Owner -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-user" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">Owner</p>
              <p class="text-sm text-muted hidden md:block">
                Created with the OWNER role and emailed a login link and temporary password.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">
          <UFormField label="Given Names" name="givenNames" required>
            <UInput v-model="state.givenNames" placeholder="e.g. Ishmael" class="w-full" :disabled="loading" />
          </UFormField>

          <UFormField label="Family Name" name="familyName" required>
            <UInput v-model="state.familyName" placeholder="e.g. Kargbo" class="w-full" :disabled="loading" />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="owner@example.com" class="w-full"
              :disabled="loading" />
          </UFormField>

          <UFormField label="Phone" name="phone" required>
            <UInput v-model="state.phone" placeholder="+232..." class="w-full" :disabled="loading" />
          </UFormField>
        </div>

        <template #footer>
          <p class="text-xs text-muted">
            The owner will be emailed a login link and temporary password for
            {{ state.domain || '<domain>' }}.skultem.space.
          </p>
        </template>
      </UCard>

      <!-- Footer -->
      <div class="flex justify-end gap-3">
        <UButton label="Cancel" color="neutral" variant="outline" to="/schools" />
        <UButton type="submit" :loading="loading" icon="i-lucide-plus" label="Onboard School" />
      </div>

    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";

const store = useSystemStore();
const { error: toastError, success: toastSuccess } = useNotify();
const { regionOptions, districtOptions } = useRdcsl();

const loading = ref(false);

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
  domain: yup.string().required("Domain is required"),
  street: yup.string().min(5, "Street must be at least 5 characters").required("Street is required"),
  city: yup.string().required("City is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  chiefdom: yup.string().min(5, "Chiefdom must be at least 5 characters").required("Chiefdom is required"),
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

// The backend generates and emails the owner their real login password itself once the school is
// created (see CreateSchoolUseCase) - this is only here to satisfy CreateSchoolDTO's validation,
// never seen or used by anyone.
function randomPassword() {
  return `Sk${Math.random().toString(36).slice(2, 10)}${Math.floor(Math.random() * 10)}!`;
}

async function onSubmit() {
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
