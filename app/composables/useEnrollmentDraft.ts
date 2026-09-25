// Keeps an unfinished Enroll Student wizard in localStorage, so leaving the page (navigating away,
// a refresh, a closed tab, a dropped connection) doesn't throw away what was already typed. Keyed
// by tenant subdomain + user id, so two schools or two staff members sharing a device never see
// each other's draft. The photo step isn't saved (a File can't go in localStorage) - it's optional
// and quick to redo.
export type EnrollmentDraft = {
  version: number
  savedAt: number
  step: number
  personal: Record<string, any>
  parent: Record<string, any>
  academic: Record<string, any>
}

const STORAGE_PREFIX = 'skultem:enrollment-draft:'
// Bump when the saved shape changes incompatibly - older drafts are then ignored instead of
// being restored into fields that no longer mean the same thing.
const VERSION = 1
// A draft nobody came back to in a month is stale (the class list, term, etc. have likely moved on).
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export function useEnrollmentDraft() {
  const { currentDomain } = useSchoolInfo()
  const userStore = useUserStore()

  function storageKey() {
    return `${STORAGE_PREFIX}${currentDomain() || 'default'}:${userStore.user?.id || 'anon'}`
  }

  function load(): EnrollmentDraft | null {
    if (typeof localStorage === 'undefined') return null
    try {
      const raw = localStorage.getItem(storageKey())
      if (!raw) return null
      const draft = JSON.parse(raw) as EnrollmentDraft
      if (draft?.version !== VERSION || Date.now() - draft.savedAt > MAX_AGE_MS) {
        clear()
        return null
      }
      return draft
    } catch {
      // Corrupt entry, or localStorage unavailable (private browsing can throw on access).
      return null
    }
  }

  function save(draft: Omit<EnrollmentDraft, 'version' | 'savedAt'>): number | null {
    if (typeof localStorage === 'undefined') return null
    const savedAt = Date.now()
    try {
      localStorage.setItem(storageKey(), JSON.stringify({ ...draft, version: VERSION, savedAt }))
      return savedAt
    } catch {
      // Quota exceeded / storage disabled - autosave is best-effort, never block the form on it.
      return null
    }
  }

  function clear() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(storageKey())
    } catch {
      // ignore
    }
  }

  return { load, save, clear }
}
