<template>
  <UBadge :color="meta.color" variant="subtle" size="sm" :icon="meta.icon" :label="meta.label" />
</template>

<script setup lang="ts">
// "Verified" only when the owner opened a verification link - see utils/emailVerification.ts.
const { status, verified } = defineProps<{
  status?: EmailVerificationState | 'INVALID' | null
  // Shorthand where only the user record is at hand.
  verified?: boolean
}>()

const meta = computed(() => EMAIL_VERIFICATION_BADGE[status ?? (verified ? 'VERIFIED' : 'UNVERIFIED')])
</script>
