# Faculty Finder

GPS-based campus location finder for Obafemi Awolowo University (OAU).

## Progressive Web App (PWA)

Faculty Finder can be installed from a supported browser when served over HTTPS.

- Open the site in Chrome on Android.
- Tap **Install app** in the page, or open the browser menu and choose **Install app** / **Add to Home screen**.
- Open the installed app from your home screen.

The service worker caches the app shell and attempts to cache the Leaflet map library so the interface and place data can remain available offline after the first successful online visit.

**Offline limitations:** live OpenStreetMap map tiles and walking-route requests are not cached. The map background and route previews therefore need an internet connection. GPS also requires device permission and may vary in accuracy.

## Main files

- `index.html` — application interface and campus place data.
- `manifest.webmanifest` — app name, display mode, colours and icon.
- `service-worker.js` — app-shell and static-asset caching.
- `icons/faculty-finder.svg` — install/app icon.

## Attribution

Built on community-contributed campus place data. Map tiles © OpenStreetMap contributors. Please verify place coordinates on the ground before relying on them for navigation.
