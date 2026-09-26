// The level dropdown options a filter should offer: the levels the school runs, narrowed to the caller's own management
// section(s) - a Primary admin is never offered JSS or SSS - and, for an owner who is viewing one section, to just
// that section's levels. Whole-school staff with no section view get every level, as before.
export function useScopedLevelOptions() {
  const { levelOptions: all, load: loadStructure } = useSchoolStructure()
  const { restrict, load: loadScope } = useMyScope()
  const { viewingSection } = useSectionView()

  const levelOptions = computed(() => {
    const own = restrict(all.value)
    const viewing = viewingSection.value
    return viewing ? own.filter(o => (viewing.levels as string[]).includes(o.value)) : own
  })

  // Call once where the options are used; safe to repeat (both loads are shared).
  async function load() {
    await Promise.all([loadStructure(), loadScope()])
  }

  return { levelOptions, load }
}
