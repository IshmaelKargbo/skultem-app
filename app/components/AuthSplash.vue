<template>
  <section class="auth-splash">
    <div class="auth-splash__aurora auth-splash__aurora--left" />
    <div class="auth-splash__aurora auth-splash__aurora--right" />
    <div class="auth-splash__grid" />

    <div class="auth-splash__shell">
      <div class="auth-splash__eyebrow">
        <span class="auth-splash__eyebrow-dot" />
        Secure session recovery
      </div>

      <div class="auth-splash__brand">
        <div class="auth-splash__brand-mark">
          <img src="/icon.svg" alt="Skultem" class="auth-splash__logo" />
        </div>
        <div class="auth-splash__brand-copy">
          <p class="auth-splash__brand-name">Skultem</p>
          <p class="auth-splash__brand-sub">School management platform</p>
        </div>
      </div>

      <div class="auth-splash__hero">
        <div class="auth-splash__orbital">
          <span class="auth-splash__ring auth-splash__ring--outer" />
          <span class="auth-splash__ring auth-splash__ring--middle" />
          <span class="auth-splash__ring auth-splash__ring--inner" />
          <div class="auth-splash__orbital-core">
            <img src="/icon.svg" alt="" class="auth-splash__orbital-icon" />
          </div>
        </div>

        <div class="auth-splash__copy">
          <h1 class="auth-splash__title">Preparing your workspace</h1>
          <p class="auth-splash__subtitle">
            Restoring your session, checking your role access, and loading the right dashboard before we open the app.
          </p>
        </div>
      </div>

      <div class="auth-splash__progress" aria-hidden="true">
        <span class="auth-splash__progress-bar" />
      </div>

      <div class="auth-splash__status">
        <span class="auth-splash__status-item">Authenticating</span>
        <span class="auth-splash__status-item">Syncing access</span>
        <span class="auth-splash__status-item">Loading navigation</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-splash {
  --splash-navy: #081225;
  --splash-ink: #10213f;
  --splash-slate: #53657f;
  --splash-line: rgba(134, 154, 181, 0.18);
  --splash-soft: rgba(255, 255, 255, 0.72);
  --splash-accent: #1d9e75;
  --splash-sky: #5ea7ff;

  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1.5rem;
  background:
    radial-gradient(circle at 18% 20%, rgba(94, 167, 255, 0.18), transparent 24%),
    radial-gradient(circle at 82% 78%, rgba(29, 158, 117, 0.16), transparent 22%),
    linear-gradient(145deg, #f7fbff 0%, #edf3fb 48%, #f5f7fb 100%);
}

.auth-splash__aurora {
  position: absolute;
  border-radius: 9999px;
  filter: blur(34px);
  opacity: 0.55;
  pointer-events: none;
}

.auth-splash__aurora--left {
  width: 18rem;
  height: 18rem;
  top: -5rem;
  left: -4rem;
  background: rgba(94, 167, 255, 0.24);
}

.auth-splash__aurora--right {
  width: 16rem;
  height: 16rem;
  right: -3rem;
  bottom: -3rem;
  background: rgba(29, 158, 117, 0.2);
}

.auth-splash__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(16, 33, 63, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 33, 63, 0.035) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 38%, transparent 100%);
  pointer-events: none;
}

.auth-splash__shell {
  position: relative;
  z-index: 1;
  width: min(100%, 37rem);
  padding: 1.3rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.52));
  box-shadow:
    0 30px 90px rgba(10, 18, 37, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(22px);
}

.auth-splash__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.85rem;
  border-radius: 9999px;
  background: rgba(8, 18, 37, 0.055);
  color: var(--splash-ink);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.auth-splash__eyebrow-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--splash-accent), #8de3c6);
  box-shadow: 0 0 0 6px rgba(29, 158, 117, 0.12);
  animation: splash-pulse 1.5s ease-in-out infinite;
}

.auth-splash__brand {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.95rem;
  padding: 1rem 1.1rem;
  border-radius: 1.4rem;
  border: 1px solid var(--splash-line);
  background: var(--splash-soft);
}

.auth-splash__brand-mark {
  width: 3.35rem;
  height: 3.35rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(145deg, #0d1b34, #16335f);
  box-shadow: 0 16px 28px rgba(8, 18, 37, 0.16);
}

.auth-splash__logo {
  width: 1.85rem;
  height: 1.85rem;
}

.auth-splash__brand-copy {
  min-width: 0;
}

.auth-splash__brand-name {
  margin: 0;
  color: var(--splash-navy);
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.auth-splash__brand-sub {
  margin: 0.18rem 0 0;
  color: var(--splash-slate);
  font-size: 0.83rem;
  font-weight: 500;
}

.auth-splash__hero {
  margin-top: 1rem;
  padding: 1.35rem 1.2rem 1.2rem;
  border-radius: 1.5rem;
  border: 1px solid var(--splash-line);
  background:
    radial-gradient(circle at top, rgba(94, 167, 255, 0.11), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(250, 252, 255, 0.72));
  text-align: center;
}

.auth-splash__orbital {
  position: relative;
  width: 8.6rem;
  height: 8.6rem;
  margin: 0 auto 1.3rem;
  display: grid;
  place-items: center;
}

.auth-splash__ring {
  position: absolute;
  border-radius: 9999px;
}

.auth-splash__ring--outer {
  inset: 0;
  border: 1.5px solid rgba(16, 33, 63, 0.12);
}

.auth-splash__ring--middle {
  inset: 0.55rem;
  border: 2px solid transparent;
  border-top-color: var(--splash-ink);
  border-right-color: var(--splash-sky);
  animation: splash-spin 1.2s linear infinite;
}

.auth-splash__ring--inner {
  inset: 1.3rem;
  border: 2px dashed rgba(29, 158, 117, 0.9);
  animation: splash-spin-reverse 1.8s linear infinite;
}

.auth-splash__orbital-core {
  width: 3.6rem;
  height: 3.6rem;
  display: grid;
  place-items: center;
  border-radius: 1.2rem;
  background: linear-gradient(145deg, #ffffff, #edf4ff);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 10px 24px rgba(16, 33, 63, 0.12);
}

.auth-splash__orbital-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.auth-splash__copy {
  max-width: 28rem;
  margin: 0 auto;
}

.auth-splash__title {
  margin: 0;
  color: var(--splash-navy);
  font-size: clamp(1.65rem, 3vw, 2.15rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.auth-splash__subtitle {
  margin: 0.8rem auto 0;
  max-width: 27rem;
  color: #42546f;
  font-size: 0.98rem;
  line-height: 1.72;
  font-weight: 500;
}

.auth-splash__progress {
  margin-top: 1rem;
  width: 100%;
  height: 0.4rem;
  overflow: hidden;
  border-radius: 9999px;
  background: rgba(134, 154, 181, 0.18);
}

.auth-splash__progress-bar {
  display: block;
  width: 38%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #143159, #1d9e75 52%, #7fc1ff 100%);
  animation: splash-progress 1.75s ease-in-out infinite;
}

.auth-splash__status {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
}

.auth-splash__status-item {
  padding: 0.55rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(134, 154, 181, 0.18);
  background: rgba(255, 255, 255, 0.84);
  color: var(--splash-ink);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

@keyframes splash-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes splash-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes splash-progress {
  0% {
    transform: translateX(-140%);
  }
  55% {
    transform: translateX(140%);
  }
  100% {
    transform: translateX(280%);
  }
}

@keyframes splash-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.16);
  }
}

@media (max-width: 640px) {
  .auth-splash {
    padding: 1rem;
  }

  .auth-splash__shell {
    padding: 1rem;
    border-radius: 1.5rem;
  }

  .auth-splash__brand,
  .auth-splash__hero {
    padding-left: 0.95rem;
    padding-right: 0.95rem;
  }

  .auth-splash__orbital {
    width: 7.2rem;
    height: 7.2rem;
  }

  .auth-splash__subtitle {
    font-size: 0.92rem;
  }
}
</style>
