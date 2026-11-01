// Opens the browser's calendar when a date field is clicked anywhere, not only on its small icon
// (Chrome otherwise only opens it from the icon, so clicking the text looks like "nothing works").
// One listener for every date/time input in the app, including ones inside modals and slideovers.
const PICKER_TYPES = new Set(['date', 'datetime-local', 'month', 'time'])

export default defineNuxtPlugin(() => {
  document.addEventListener('click', (event) => {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || !PICKER_TYPES.has(input.type)) return
    if (input.disabled || input.readOnly) return

    try {
      input.showPicker?.()
    } catch {
      // Not supported, or already open - the browser's normal behaviour still applies.
    }
  })
})
