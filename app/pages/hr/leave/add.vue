<template>
  <div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">
        New Leave Request
      </h1>

      <p class="text-sm text-muted">
        Submit a new leave request for an employee.
      </p>
    </div>

    <UForm
      :state="state"
      class="space-y-6"
    >

      <!-- Employee Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" />
            <span class="font-semibold">
              Employee Information
            </span>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">

          <UFormField label="Employee">
            <USelectMenu
              v-model="state.employee"
              :items="employees"
              placeholder="Select employee"
            />
          </UFormField>

          <UFormField label="Department">
            <UInput
              v-model="state.department"
              placeholder="Department"
            />
          </UFormField>

        </div>
      </UCard>

      <!-- Leave Details -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar-days" />
            <span class="font-semibold">
              Leave Details
            </span>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">

          <UFormField label="Leave Type">
            <USelectMenu
              v-model="state.leaveType"
              :items="leaveTypes"
              placeholder="Select type"
            />
          </UFormField>

          <UFormField label="Duration">
            <UInput
              v-model="state.duration"
              placeholder="5 days"
            />
          </UFormField>

          <UFormField label="Start Date">
            <UInput
              v-model="state.startDate"
              type="date"
            />
          </UFormField>

          <UFormField label="End Date">
            <UInput
              v-model="state.endDate"
              type="date"
            />
          </UFormField>

        </div>
      </UCard>

      <!-- Reason -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" />
            <span class="font-semibold">
              Reason for Leave
            </span>
          </div>
        </template>

        <UTextarea
          v-model="state.reason"
          :rows="5"
          placeholder="Provide details about the leave request..."
        />
      </UCard>

      <!-- Attachment -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-paperclip" />
            <span class="font-semibold">
              Supporting Documents
            </span>
          </div>
        </template>

        <UInput
          type="file"
        />

        <p class="mt-2 text-xs text-muted">
          Medical certificates or approval letters can be attached.
        </p>
      </UCard>

      <!-- Emergency Contact -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-phone" />
            <span class="font-semibold">
              Emergency Contact
            </span>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">

          <UFormField label="Contact Name">
            <UInput
              v-model="state.contactName"
              placeholder="Full name"
            />
          </UFormField>

          <UFormField label="Phone Number">
            <UInput
              v-model="state.phone"
              placeholder="+232..."
            />
          </UFormField>

        </div>
      </UCard>

      <!-- Buttons -->
      <div class="flex justify-end gap-3">

        <UButton
          variant="soft"
          color="neutral"
          target="/hr/leave"
        >
          Cancel
        </UButton>

        <UButton
          icon="i-lucide-send"
        >
          Submit Request
        </UButton>

      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
const employees = [
  "John Doe",
  "Mary Kamara",
  "Peter Sesay"
]

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Study Leave"
]

const state = reactive({
  employee: "",
  department: "",
  leaveType: "",
  duration: "",
  startDate: "",
  endDate: "",
  reason: "",
  contactName: "",
  phone: ""
})
</script>