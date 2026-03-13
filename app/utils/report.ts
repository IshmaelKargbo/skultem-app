export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export type SavedReport = {
  id: string
  name: string
  type: string
  format: string
  classId?: string | null
  classSessionId?: string | null
  teacherSubjectId?: string | null
  termId?: string | null
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
}

export type ReportTable = {
  headers: string[]
  rows: string[][]
}

export type ReportSelectPayload = {
    name: string
    filters: ReportFilter[]
}

export type ReportOperator = {
  name: string
  operator: string
  type: string
  input: string
  options: Option[]
}

export type ReportFilter = {
  field: string
  label: string
  operators: ReportOperator[]
}

export type ReportFilters = {
  name: string
  filters: ReportFilter[]
}