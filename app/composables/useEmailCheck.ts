// The live check behind an email field: format at once, then the domain (DNS, on the server) once the person has
// paused typing or left the field - not on every keystroke. Answers are remembered for the session, so retyping an
// address doesn't ask again. A failed check (server unreachable) never marks the address invalid.
const remembered = new Map<string, EmailCheck>()

export function useEmailCheck(email: Ref<string | null | undefined>, debounceMs = 700) {
  const checking = ref(false)
  const result = ref<EmailCheck | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined
  let latest = 0

  const value = computed(() => (email.value ?? '').trim())
  const formatOk = computed(() => looksLikeEmail(value.value))

  async function run() {
    clearTimeout(timer)
    const v = value.value
    if (!v || !formatOk.value) {
      result.value = null
      checking.value = false
      return
    }
    const key = v.toLowerCase()
    const hit = remembered.get(key)
    if (hit) {
      result.value = hit
      return
    }
    const mine = ++latest
    checking.value = true
    try {
      const res = await EmailVerificationApi().check(v)
      if (mine !== latest) return
      if (res) {
        remembered.set(key, res)
        result.value = res
      }
    } catch {
      if (mine === latest) result.value = null
    } finally {
      if (mine === latest) checking.value = false
    }
  }

  watch(value, () => {
    clearTimeout(timer)
    result.value = null
    if (formatOk.value) timer = setTimeout(run, debounceMs)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return { checking, result, formatOk, checkNow: run }
}
