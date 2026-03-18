<template>
    <UCard>
        <div class="space-y-4">
            <div class="flex items-start gap-3">
                <USkeleton class="h-10 w-10 rounded-lg" />
                <div class="space-y-1 flex-1">
                    <USkeleton class="h-4 w-3/4" />
                    <USkeleton class="h-3 w-1/2" />
                </div>
            </div>
            <USkeleton class="h-28 w-full rounded-xl" />
            <div class="flex items-center justify-between">
                <USkeleton class="h-3 w-24" />
                <USkeleton class="h-6 w-14 rounded-md" />
            </div>
        </div>
    </UCard>
</template>