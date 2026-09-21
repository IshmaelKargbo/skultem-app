// The frontend's view of "what has this school installed" - used by the menus, the route guard and
// any screen that touches a module's data from outside that module (a dashboard widget, a tab on a
// student). Everything here fails open until the module list has loaded, so a slow or failed fetch
// never hides features; the backend blocks uninstalled modules on every request either way.
export function useModules() {
  const store = useModuleStore()

  // The admin portal isn't a school - it has no modules to install, and nothing there is gated.
  const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

  function isInstalled(key: string): boolean {
    if (onAdminPortal || !store.loaded) return true
    return store.isInstalled(key)
  }

  /** False only when the route belongs to a module this school hasn't installed. */
  function isPathAvailable(path: string): boolean {
    const key = moduleForPath(path)
    return key == null || isInstalled(key)
  }

  return { isInstalled, isPathAvailable }
}
