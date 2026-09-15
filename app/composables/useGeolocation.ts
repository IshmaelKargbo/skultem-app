// Shared by the teacher clock-in/out widgets (dashboard widget + full page).
//
// Both call this with enableHighAccuracy + maximumAge: 0, which forces a brand new GPS
// fix rather than accepting a cached one. On Android that regularly takes longer than a
// short timeout - especially indoors, or on a cold GPS chip right after opening the app -
// so users were seeing a PositionError code 3 (TIMEOUT) that iOS/Safari rarely hits with
// the same settings (it tends to answer from a recent fix instead of forcing GPS).
//
// Fix: give the high-accuracy attempt more time, and if it still times out, retry once
// with enableHighAccuracy off and a cached fix allowed - Android's network/passive
// location provider answers that almost instantly, and it's still accurate enough for the
// server-side geofence check (which already warns separately on low accuracy).
export function getGeoPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Your browser does not support location services.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, (err) => {
      if (err.code === err.TIMEOUT) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 120000
        })
        return
      }

      reject(err)
    }, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    })
  })
}
