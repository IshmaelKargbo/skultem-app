// Page guides: a short walkthrough that opens by itself the first time someone visits a page, highlighting each
// part with a word on what it's for. The Guide button replays it. Which guides a person has already seen is kept
// in this browser (per account), so a guide shows once per device. Guides live in utils/pageGuides.ts; the parts
// they point at carry data-guide="..." attributes.
const SEEN_KEY = 'skultem:guides-seen'

export function usePageGuide() {
  const active = useState<{ id: string, index: number } | null>('page-guide-active', () => null)

  function storageKey() {
    const email = useUserStore().user?.email ?? 'anonymous'
    return `${SEEN_KEY}:${email}`
  }

  function seenList(): string[] {
    try {
      return JSON.parse(localStorage.getItem(storageKey()) || '[]')
    } catch {
      return []
    }
  }

  function hasSeen(id: string) {
    return seenList().includes(id)
  }

  function markSeen(id: string) {
    try {
      const list = seenList()
      if (!list.includes(id)) localStorage.setItem(storageKey(), JSON.stringify([...list, id]))
    } catch {
      // Private window / storage blocked: the guide may show again next time, which is harmless.
    }
  }

  function start(id: string) {
    if (!PAGE_GUIDES[id]) return
    active.value = { id, index: 0 }
  }

  // Opens a guide the first time only.
  function autoStart(id: string) {
    if (!hasSeen(id) && !active.value) start(id)
  }

  function finish() {
    if (active.value) markSeen(active.value.id)
    active.value = null
  }

  return { active, start, autoStart, finish, hasSeen, markSeen }
}
