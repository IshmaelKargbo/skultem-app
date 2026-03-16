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
  entity: string
  filters: ReportFilterSelected[]
  createdAt: string
  updatedAt: string
}

export type CreateSavedReport = {
  id?: string
  name: string
  entity: string
  filters: ReportFilterSelected[]
}

export type ReportTable = {
  headers: string[]
  rows: string[][]
}

export type ReportSelectPayload = {
  entity: string
  filters: ReportFilter[]
}

export type ReportSelectFilterPayload = {
  name?: string
  entity: string
  filters: ReportFilterSelected[]
}

export type ReportOperator = {
  name: string
  operator: string
  type: string
  input: string
  options: Option[]
}

export type ReportFilterSelected = {
  field: string
  type: string
  operator: string
  value: string
  valueTo: string
}

export type ReportFilter = {
  field: string
  label: string
  operators: ReportOperator[]
  default?: number
}

export type ReportFilters = {
  name: string
  filters: ReportFilter[]
}