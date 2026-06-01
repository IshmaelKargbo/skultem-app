export default defineNuxtPlugin(() => {
  const scrollToTop = () => {
    const container = document.querySelector('.max-w-screen-2xl.overflow-y-auto') as HTMLElement | null

    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null
    const pagination = target?.closest('[aria-label*="Pagination"], nav')

    if (!pagination?.querySelector('[aria-current="page"]')) return

    window.setTimeout(scrollToTop, 50)
  })
})
