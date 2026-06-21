<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Add Week
        </h1>

        <p class="mt-1 text-sm text-muted">
          Create weekly topics, objectives and assessments.
        </p>
      </div>

      <div class="flex gap-3">

        <UButton
          to="/curriculums/weeks"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
          label="Back"
        />

        <UButton
          type="submit"
          form="week-form"
          icon="i-lucide-save"
          label="Save Week"
        />

      </div>

    </div>


    <UForm
      id="week-form"
      ref="formRef"
      :state="state"
      :schema="schema"
      class="space-y-6"
      @submit="onSubmit"
    >

      <!-- Basic Information -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-book-open"
              class="text-primary"
            />

            <span class="font-semibold">
              Topic Information
            </span>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField
            label="Week Number"
            name="weekNumber"
            required
          >
            <UInput
              v-model="state.weekNumber"
              type="number"
              leading-icon="i-lucide-hash"
            />
          </UFormField>

          <UFormField
            label="Topic"
            name="topic"
            required
          >
            <UInput
              v-model="state.topic"
              leading-icon="i-lucide-book"
              placeholder="Whole Numbers"
            />
          </UFormField>

          <UFormField
            label="Sub Topic"
            name="subTopic"
          >
            <UInput
              v-model="state.subTopic"
              leading-icon="i-lucide-book-copy"
            />
          </UFormField>

          <UFormField
            label="Status"
            name="status"
          >
            <USelectMenu
              v-model="state.status"
              :items="statuses"
              value-key="value"
            />
          </UFormField>

        </div>

      </UCard>


      <!-- Learning Objectives -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-target"
              class="text-primary"
            />

            <span class="font-semibold">
              Learning Objectives
            </span>
          </div>
        </template>

        <UFormField label="Objectives">
          <UTextarea
            v-model="state.objectives"
            :rows="4"
            placeholder="One objective per line"
          />
        </UFormField>

      </UCard>


      <!-- Teaching Activities -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-users"
              class="text-primary"
            />

            <span class="font-semibold">
              Teaching Activities
            </span>
          </div>
        </template>

        <UFormField label="Activities">
          <UTextarea
            v-model="state.activities"
            :rows="4"
            placeholder="Discussion, Group Work, Demonstration..."
          />
        </UFormField>

      </UCard>


      <!-- Resources -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-folder-open"
              class="text-primary"
            />

            <span class="font-semibold">
              Resources
            </span>
          </div>
        </template>

        <UFormField label="Learning Materials">
          <UTextarea
            v-model="state.resources"
            :rows="3"
          />
        </UFormField>

      </UCard>


      <!-- Assessment -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-clipboard-check"
              class="text-primary"
            />

            <span class="font-semibold">
              Assessment
            </span>
          </div>
        </template>

        <UFormField label="Assessment">
          <UTextarea
            v-model="state.assessment"
            :rows="3"
          />
        </UFormField>

      </UCard>

    </UForm>

  </div>
</template>
<script setup lang="ts">
import * as yup from 'yup'

const formRef = ref()

const statuses = [
  {
    label: 'Not Started',
    value: 'NOT_STARTED'
  },
  {
    label: 'In Progress',
    value: 'IN_PROGRESS'
  },
  {
    label: 'Completed',
    value: 'COMPLETED'
  }
]

const state = reactive({
  weekNumber: 1,
  topic: '',
  subTopic: '',
  objectives: '',
  activities: '',
  resources: '',
  assessment: '',
  status: 'NOT_STARTED'
})

const schema = yup.object({
  weekNumber: yup.number().required(),
  topic: yup.string().required(),
  status: yup.string().required()
})

async function onSubmit() {
  console.log(state)

  // await weekStore.create(state)

  await navigateTo('/scheme-of-work/weeks')
}

onMounted(() => {
  useAppStore().setTitle('Add Week')

  document.title =
    'Add Week | Scheme of Work | Skultem'
})
</script>