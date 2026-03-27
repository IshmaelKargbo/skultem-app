<template>
    <Teleport to="body">
        <Transition name="loader">
            <div v-if="visible" class="loader-backdrop">
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
                    <div class="loader-text">
                        <p class="loader-title">{{ title }}</p>
                        <p class="loader-sub">{{ subtitle }}</p>
                    </div>

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
const { visible, title, subtitle, hint } = useGlobalLoader()

const roles = ['Student', 'Teacher', 'Admin', 'Parent']
</script>

<style scoped>
/* Backdrop */
.loader-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgb(255, 255, 255);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
}

/* Card */
.loader-card {
    position: relative;
    background: var(--ui-bg, #fff);
    padding: 36px 40px;
    display: flex; flex-direction: column; align-items: center; gap: 18px;
    min-width: 280px;
    overflow: hidden;
}

/* Dot bg */
.loader-dots {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.35;
}

/* Cap + rings */
.cap-wrap {
    position: relative; width: 72px; height: 72px;
    display: flex; align-items: center; justify-content: center;
    z-index: 1;
}
.cap-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--ui-primary, #6366f1);
    border-right-color: var(--ui-primary, #6366f1);
    animation: spin 1.2s linear infinite;
}
.cap-ring-2 {
    position: absolute; inset: 7px; border-radius: 50%;
    border: 2px dashed transparent;
    border-bottom-color: #1D9E75;
    border-left-color: #1D9E75;
    animation: spin 1.8s linear infinite reverse;
}
.cap-emoji { font-size: 28px; line-height: 1; }

/* Text */
.loader-text { text-align: center; z-index: 1; }
.loader-title { font-size: 1rem; font-weight: 600; color: var(--ui-text, #111); margin: 0; }
.loader-sub   { font-size: 0.78rem; color: var(--ui-text-muted, #6b7280); margin: 4px 0 0; }

/* Progress */
.progress-wrap { width: 200px; z-index: 1; }
.progress-hint { font-size: 0.7rem; color: var(--ui-text-muted, #9ca3af); text-align: center; margin-bottom: 6px; }
.progress-track {
    height: 4px; background: var(--ui-bg-elevated, #f3f4f6);
    border-radius: 99px; overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: var(--ui-primary, #6366f1);
    border-radius: 99px;
    animation: progress-wave 1.6s ease-in-out infinite;
}

/* Pencil */
.writing-wrap { display: flex; align-items: center; gap: 8px; z-index: 1; }
.pencil { font-size: 14px; animation: pencil-bounce 0.5s ease-in-out infinite alternate; }
.writing-line {
    height: 2px; width: 120px;
    background: var(--ui-bg-elevated, #f3f4f6);
    border-radius: 99px; overflow: hidden; position: relative;
}
.writing-fill {
    position: absolute; top: 0; left: -50%; height: 100%; width: 50%;
    background: linear-gradient(90deg, transparent, var(--ui-primary, #6366f1), transparent);
    animation: shimmer 1.2s linear infinite;
}

/* Role chips */
.role-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; z-index: 1; }
.chip {
    font-size: 0.68rem; padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid var(--ui-border, #e5e7eb);
    color: var(--ui-text-muted, #6b7280);
    background: var(--ui-bg-elevated, #f9fafb);
    animation: chip-fade 2.4s ease-in-out infinite;
}
.chip:nth-child(2) { animation-delay: 0.3s; }
.chip:nth-child(3) { animation-delay: 0.6s; }
.chip:nth-child(4) { animation-delay: 0.9s; }

/* Transition */
.loader-enter-active, .loader-leave-active { transition: opacity 0.2s ease; }
.loader-enter-from, .loader-leave-to { opacity: 0; }

/* Keyframes */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes progress-wave {
    0%   { width: 0%;  margin-left: 0%; }
    50%  { width: 60%; margin-left: 20%; }
    100% { width: 0%;  margin-left: 100%; }
}
@keyframes pencil-bounce {
    from { transform: translateY(0); }
    to   { transform: translateY(-4px); }
}
@keyframes shimmer { from { left: -50%; } to { left: 100%; } }
@keyframes chip-fade { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
</style>