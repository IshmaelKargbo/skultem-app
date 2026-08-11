export default defineNuxtRouteMiddleware(() => {
  const { accessToken } = useAuthCookies()

  if (accessToken.value) {
    return navigateTo("/")
  }
})