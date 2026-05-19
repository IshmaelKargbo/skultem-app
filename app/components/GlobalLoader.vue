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
const { visible, title, subtitle } = useGlobalLoader()
const roles = ['Student', 'Teacher', 'Admin', 'Parent']
</script>

<style scoped>
/* ── Backdrop ───────────────────────────────────────────── */
.loader-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);
}

/* ── Card ───────────────────────────────────────────────── */
.loader-card {
    position: relative;
    background: #ffffff;
    border: 1px solid #e5e7eb;
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
    background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
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
    border-top-color: #6366f1;
    border-right-color: #6366f1;
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

/* ── Text ───────────────────────────────────────────────── */
.loader-text { text-align: center; z-index: 1; }
.loader-title {
    font-size: 1rem; font-weight: 600;
    color: #111827; margin: 0;
}
.loader-sub {
    font-size: 0.78rem; color: #6b7280;
    margin: 4px 0 0;
}

/* ── Pencil writing ─────────────────────────────────────── */
.writing-wrap { display: flex; align-items: center; gap: 8px; z-index: 1; }
.pencil { font-size: 14px; animation: pencil-bounce 0.5s ease-in-out infinite alternate; }
.writing-line {
    height: 2px; width: 120px;
    background: #f3f4f6;
    border-radius: 99px; overflow: hidden; position: relative;
}
.writing-fill {
    position: absolute; top: 0; left: -50%; height: 100%; width: 50%;
    background: linear-gradient(90deg, transparent, #6366f1, transparent);
    animation: shimmer 1.2s linear infinite;
}

/* ── Role chips ─────────────────────────────────────────── */
.role-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; z-index: 1; }
.chip {
    font-size: 0.68rem; padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid #e5e7eb;
    color: #6b7280;
    background: #f9fafb;
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
.dark .loader-backdrop {
    background: var(--color-gray-950);
}

.dark .loader-card {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.dark .loader-dots {
    opacity: 0.12;
    background-image: radial-gradient(circle, #334155 1px, transparent 1px);
}
.dark .loader-title { color: #f8fafc; }
.dark .loader-sub   { color: #94a3b8; }
.dark .writing-line { background: #1e293b; }
.dark .writing-fill {
    background: linear-gradient(90deg, transparent, #818cf8, transparent);
}
.dark .chip {
    background: #1e293b;
    border-color: #334155;
    color: #94a3b8;
}

.dark .cap-ring {
    border-top-color: #818cf8;
    border-right-color: #818cf8;
}

/* ── Keyframes ──────────────────────────────────────────── */
@keyframes spin          { to { transform: rotate(360deg); } }
@keyframes pencil-bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
@keyframes shimmer       { from { left: -50%; } to { left: 100%; } }
@keyframes chip-fade     { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
</style>