# Faculty Finder data quality notes

## Current audit

The primary app currently contains 59 place records. Of these, 24 are explicitly marked `approx: true`; those pins are shown as approximate in the interface. Do not treat them as ground-truth coordinates.

### Exact coordinate collisions

These records currently share exact coordinates:

| Coordinates (latitude, longitude) | Records sharing the pin |
| --- | --- |
| `7.51812, 4.51484` | New Bukateria; ETF Hall |
| `7.52, 4.527` | 1000 Seater Lecture Theatre; Hezekiah Oluwasanmi Library; Motion Ground |
| `7.521, 4.526` | Post Office; Centre for Gender and Social Policy Studies |

The app now surfaces a warning when a selected record shares its coordinates with another record. The values have **not** been changed automatically: changing coordinates without reliable evidence could make navigation worse.

## How to verify a pin

1. Visit the location on campus, ideally with a GPS-enabled phone outdoors.
2. Confirm the exact building entrance or landmark with a campus sign or a trusted campus source.
3. Record coordinates at the intended destination, not a nearby road or broad area.
4. Update the corresponding record in `index.html`.
5. Remove `approx: true` only after the location has been checked.
6. Run `node scripts/validate-places.mjs` and test the location on a phone.

GPS readings can drift near buildings and under tree cover. For important destinations, compare multiple readings or use a trusted map/survey source. Do not invent coordinates to make duplicate pins look different.

## Navigation safeguards

- GPS feedback includes the reported accuracy radius when available.
- Route requests have a timeout and validate the returned response.
- If a route request fails, the app no longer draws a dashed straight line that could be mistaken for a walking route.
- A route response is discarded if the selected destination or start point changes while it is loading.
- OpenStreetMap routing and map tiles still require an internet connection.
