<!-- Opens the help for a feature: what it does, what has to be in place first, how to use it, and tips. -->
<template>
  <UButton icon="i-lucide-book-open" color="neutral" variant="ghost" label="Help" class="justify-center"
    :disabled="!help" @click="() => { open = true }" />

  <UModal v-if="help" v-model:open="open" :title="help.title" :description="help.summary" :ui="{ content: 'max-w-xl' }">
    <template #body>
      <div class="space-y-5 text-sm">
        <section>
          <h4 class="mb-2 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon name="i-lucide-sparkles" class="size-4 text-primary" /> What it does
          </h4>
          <ul class="ml-6 list-disc space-y-1 text-muted">
            <li v-for="(line, i) in help.whatItDoes" :key="i">{{ line }}</li>
          </ul>
        </section>

        <section class="rounded-xl border border-warning/30 bg-warning/5 p-3">
          <h4 class="mb-2 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon name="i-lucide-list-checks" class="size-4 text-warning" /> Before you start
          </h4>
          <ul class="space-y-2">
            <li v-for="(item, i) in help.beforeYouStart" :key="i" class="flex items-start gap-2">
              <UIcon name="i-lucide-circle-check" class="mt-0.5 size-4 shrink-0 text-warning" />
              <span class="text-muted">
                {{ item.text }}
                <span v-if="item.who" class="mt-0.5 block text-xs font-medium text-highlighted">Who sets this up: {{ item.who }}</span>
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h4 class="mb-2 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon name="i-lucide-footprints" class="size-4 text-primary" /> How to use it
          </h4>
          <ol class="space-y-2">
            <li v-for="(line, i) in help.howTo" :key="i" class="flex items-start gap-2.5">
              <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{{ i + 1 }}</span>
              <span class="text-muted">{{ line }}</span>
            </li>
          </ol>
        </section>

        <section v-if="help.tips?.length">
          <h4 class="mb-2 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon name="i-lucide-lightbulb" class="size-4 text-primary" /> Tips
          </h4>
          <ul class="ml-6 list-disc space-y-1 text-muted">
            <li v-for="(line, i) in help.tips" :key="i">{{ line }}</li>
          </ul>
        </section>

        <section v-if="help.faq?.length">
          <h4 class="mb-2 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon name="i-lucide-message-circle-question" class="size-4 text-primary" /> Common questions
          </h4>
          <div class="space-y-2">
            <div v-for="(f, i) in help.faq" :key="i" class="rounded-lg bg-elevated/50 p-2.5">
              <p class="font-medium text-highlighted">{{ f.q }}</p>
              <p class="mt-0.5 text-muted">{{ f.a }}</p>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <UButton v-if="help.guide" icon="i-lucide-route" variant="soft" label="Show me around this page"
          @click="startGuide" />
        <span v-else />
        <UButton color="neutral" variant="outline" label="Close" @click="() => { open = false }" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { topic } = defineProps<{ topic: string }>()
const { start } = usePageGuide()

const open = ref(false)
const help = computed(() => PAGE_HELP[topic] ?? null)

async function startGuide() {
  open.value = false
  // Let the modal close before the guide highlights the page behind it.
  await new Promise(r => setTimeout(r, 300))
  if (help.value?.guide) start(help.value.guide)
}
</script>
