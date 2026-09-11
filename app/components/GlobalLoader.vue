<template>
    <Teleport to="body">
        <Transition name="loader">
            <!-- v-show (not v-if): keeps the card mounted so its CSS animations (spinning
                 rings, bouncing pencil, shimmering line) keep running continuously instead of
                 restarting from frame zero every time the loader toggles - back-to-back
                 navigations were unmounting/remounting it fast enough that the icon visibly
                 jumped/flickered on each re-show. -->
            <div v-show="visible" class="loader-backdrop">
                <div class="loader-card">

                    <!-- Dot grid bg -->
                    <div class="loader-dots" />

                    <!-- Spinning cap -->
                    <div class="cap-wrap">
                        <div class="cap-ring" />
                        <div class="cap-ring-2" />
                        <span class="cap-emoji">🎓</span>
                    </div>

                    <!-- Text -->
                    <!-- <div class="loader-text">
                        <p class="loader-title">{{ title }}</p>
                        <p class="loader-sub">{{ subtitle }}</p>
                    </div> -->

                    <!-- Pencil writing -->
                    <div class="writing-wrap">
                        <span class="pencil">✏️</span>
                        <div class="writing-line">
                            <div class="writing-fill" />
                        </div>
                    </div>

                    <!-- Role chips -->
                    <div class="role-chips">
                        <span v-for="r in roles" :key="r" class="chip">{{ r }}</span>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
const { visible, title, subtitle } = useGlobalLoader()
const roles = ['Student', 'Teacher', 'Admin', 'Parent']
</script>

<style scoped>
/* ── Backdrop ───────────────────────────────────────────── */
/* Rides the app own light/dark surface tokens (assets/css/main.css) and the school brand
   colors (--color-primary- and --color-secondary- shades, see utils/theme.ts) - both already
   flip/update on their own, so this needs no separate .dark block for any of it. */
.loader-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in oklab, var(--app-bg) 85%, transparent);
    backdrop-filter: blur(6px);
}

/* ── Card ───────────────────────────────────────────────── */
.loader-card {
    position: relative;
    background: var(--app-card);
    border: 1px solid var(--app-border);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    padding: 36px 40px;
    display: flex; flex-direction: column; align-items: center; gap: 18px;
    min-width: 280px;
    overflow: hidden;
}

/* ── Dot background ─────────────────────────────────────── */
.loader-dots {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, color-mix(in oklab, var(--app-text-faint) 60%, transparent) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.4;
}

/* ── Spinning cap ───────────────────────────────────────── */
.cap-wrap {
    position: relative; width: 72px; height: 72px;
    display: flex; align-items: center; justify-content: center;
    z-index: 1;
}
.cap-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--color-primary-500);
    border-right-color: var(--color-primary-500);
    animation: spin 1.2s linear infinite;
}
.cap-ring-2 {
    position: absolute; inset: 7px; border-radius: 50%;
    border: 2px dashed transparent;
    border-bottom-color: var(--color-secondary-500);
    border-left-color: var(--color-secondary-500);
    animation: spin 1.8s linear infinite reverse;
}
.cap-emoji { font-size: 28px; line-height: 1; }

/* ── Text ───────────────────────────────────────────────── */
.loader-text { text-align: center; z-index: 1; }
.loader-title {
    font-size: 1rem; font-weight: 600;
    color: var(--app-text-strong); margin: 0;
}
.loader-sub {
    font-size: 0.78rem; color: var(--app-text-soft);
    margin: 4px 0 0;
}

/* ── Pencil writing ─────────────────────────────────────── */
.writing-wrap { display: flex; align-items: center; gap: 8px; z-index: 1; }
.pencil { font-size: 14px; animation: pencil-bounce 0.5s ease-in-out infinite alternate; }
.writing-line {
    height: 2px; width: 120px;
    background: color-mix(in oklab, var(--app-border) 80%, transparent);
    border-radius: 99px; overflow: hidden; position: relative;
}
.writing-fill {
    position: absolute; top: 0; left: -50%; height: 100%; width: 50%;
    background: linear-gradient(90deg, transparent, var(--color-primary-500), transparent);
    animation: shimmer 1.2s linear infinite;
}

/* ── Role chips ─────────────────────────────────────────── */
.role-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; z-index: 1; }
.chip {
    font-size: 0.68rem; padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid var(--app-border);
    color: var(--app-text-soft);
    background: color-mix(in oklab, var(--app-bg) 92%, transparent);
    animation: chip-fade 2.4s ease-in-out infinite;
}
.chip:nth-child(2) { animation-delay: 0.3s; }
.chip:nth-child(3) { animation-delay: 0.6s; }
.chip:nth-child(4) { animation-delay: 0.9s; }

/* ── Transition ─────────────────────────────────────────── */
.loader-enter-active,
.loader-leave-active { transition: opacity 0.25s ease; }
.loader-enter-from,
.loader-leave-to { opacity: 0; }

/* ── Dark mode ──────────────────────────────────────────── */
/* Everything else above already rides tokens that flip on their own (app and brand color
   variables) - the dot pattern is the one thing that still needs a dark-specific tweak, since
   it would read too harsh at the same opacity against a dark surface. */
.dark .loader-dots {
    opacity: 0.12;
}
.dark .loader-card {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* ── Keyframes ──────────────────────────────────────────── */
@keyframes spin          { to { transform: rotate(360deg); } }
@keyframes pencil-bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
@keyframes shimmer       { from { left: -50%; } to { left: 100%; } }
@keyframes chip-fade     { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
</style>