<script lang="ts" setup>
const { subtitle, title } = defineProps<{
    title: string
    subtitle: string
}>()
</script>

<template>
  
       <UCard>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0 space-y-0.5">
                <p class="text-lg font-display font-semibold leading-tight sm:text-xl md:text-2xl">
                    {{ title }}
                </p>
                <p class="text-sm text-muted sm:text-base">
                    {{ subtitle }}
                </p>
            </div>
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
                <slot />
            </div>
        </div>
       </UCard>
</template>
