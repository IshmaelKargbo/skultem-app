// The school's exam timetable PDF design, fetched once and shared by the Design page and every download.
export function useExamTimetableDesign() {
  const design = useState<ExamTimetableDesign>('exam-timetable-design', () => ({ ...DEFAULT_EXAM_TIMETABLE_DESIGN }))
  const loaded = useState<boolean>('exam-timetable-design-loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force) return design.value
    try {
      const res = await ExamOfficeApi().timetableDesign()
      if (res) design.value = { ...DEFAULT_EXAM_TIMETABLE_DESIGN, ...res, footerNote: res.footerNote ?? null }
      loaded.value = true
    } catch {
      // Keep the defaults - a download still works.
    }
    return design.value
  }

  async function save() {
    const res = await ExamOfficeApi().saveTimetableDesign(design.value)
    if (res) design.value = { ...DEFAULT_EXAM_TIMETABLE_DESIGN, ...res, footerNote: res.footerNote ?? null }
    return design.value
  }

  return { design, load, save }
}
