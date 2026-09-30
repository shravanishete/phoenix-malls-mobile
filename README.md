# Phoenix Malls – Global Map Experience (Android)

React Native + Expo + TypeScript app for exploring Phoenix Malls across countries on an interactive world map.

**Core journey:** World map → Country → Mall marker → Live OPEN/CLOSED status → Mall details

> Companion web app: `phoenix-malls-web` (React + Vite + Leaflet). Both apps share the same data model and business logic.



## Features

- Interactive world map with zoom, pan and country markers
- Tap a country: the map flies to it and shows its mall markers
- Live status per mall, calculated in the **mall's own timezone**
  - Open malls: green marker with a pulse animation
  - Closed malls: red marker, static
  - Missing or invalid hours: grey marker ("unavailable")
- Mall details card: photo, name, city, address, today's hours, phone, website, directions
- Menu (☰): search malls and cities, Open / Closed filter, nearest mall to me
- Loading, empty and error states with retry
- Handles overnight hours (for example 18:00 to 02:00)

## Tech stack

| Area | Library |
|---|---|
| Framework | React Native 0.86, Expo SDK 57 |
| Navigation | Expo Router |
| Language | TypeScript (strict) |
| Map | `@maplibre/maplibre-react-native` (native map, OpenStreetMap raster tiles) |
| Date and timezone | Luxon |
| Location | `expo-location` |
| Tests | Vitest |
| Builds | EAS Build |

## Getting started

### Prerequisites
- Node.js 20+
- An Android phone with USB debugging or Wi-Fi access to your PC
- A free Expo account (for cloud builds)

### Install and run

```bash
npm install
npx tsc --noEmit        # type check
npx vitest run          # unit tests
```

**This app cannot run in Expo Go.** MapLibre and `expo-location` contain native code, so you need a development build:

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Install the resulting APK on your phone, then:

```bash
npx expo start --dev-client
```

Open the **phoenix-malls-mobile** app on the phone and connect to the dev server (same Wi-Fi as your PC).

### Standalone APK (no PC needed)

```bash
npx eas-cli build --profile preview --platform android
```


## Architecture

```
app/                    Expo Router screens
  _layout.tsx
  index.tsx             World map screen (map, menu, cards)
src/
  types/                Mall, Country, OperatingHours, MallStatus
  data/                 countries.json, malls.json (mock data)
  services/
    mallRepository.ts   Interface: the contract for reading data
    mockMallRepository.ts   Mock implementation (JSON + simulated latency)
    mallService.ts      The ONE place the data source is chosen; wraps errors
  logic/
    getMallStatus.ts    Open/closed calculation (pure function)
    filterMallsByStatus.ts
    findNearestMall.ts  Great-circle distance
  hooks/                useAsync, useMalls, useNow
  map/mapConfig.ts      World view, zoom limits, bounds, tile style
  mall/                 MallDetailsCard, PulseDot, and related UI
  utils/                Time formatting, image lookup
```

### Layers

1. **UI** (`app/`, `src/mall/`): native components only (`View`, `Text`, `Pressable`, `StyleSheet`).
2. **State and data flow** (`src/hooks/`): `useAsync` tracks loading, success and error. `useNow` refreshes the clock every minute so status updates without a reload.
3. **Business logic** (`src/logic/`): pure functions with no React and no map code.
4. **Data access** (`src/services/`): screens only call `mallService`.

### Swapping the mock data for a real REST API

`MallRepository` mirrors the future endpoints:

| Method | Endpoint |
|---|---|
| `getCountries()` | `GET /countries` |
| `getMallsByCountry(code)` | `GET /countries/{code}/malls` |
| `getMallById(id)` | `GET /malls/{id}` |
| `searchMalls(query)` | `GET /malls?search=` |
| `getAllMalls()` | `GET /malls` |

To use a real API, write `createHttpMallRepository(baseUrl)` and change one line in `mallService.ts`. No screen or business-logic file changes.

### Data shape

```json
{
  "id": "phoenix-marketcity-pune",
  "name": "Phoenix Marketcity Pune",
  "country": "India",
  "countryCode": "IN",
  "city": "Pune",
  "latitude": 18.562,
  "longitude": 73.9166,
  "image": "/images/malls/phoenix-marketcity-pune.jpg",
  "address": "207, Viman Nagar Rd, Viman Nagar, Pune, Maharashtra 411014",
  "phone": "+91 20 6720 0000",
  "website": "https://www.phoenixmarketcity.com/pune",
  "timezone": "Asia/Kolkata",
  "operatingHours": {
    "monday": { "open": "10:00", "close": "22:00" },
    "sunday": { "open": "10:00", "close": "23:00" }
  }
}
```

Per day: hours object = open, `null` = closed all day, key missing = unknown.

## Live status and timezones

`getMallStatus(mall, now)`:

1. Converts `now` into the mall's timezone (`now.setZone(mall.timezone)`). Luxon applies daylight saving. An invalid timezone returns `unavailable`.
2. Converts times to minutes since midnight and compares numbers.
3. Checks **yesterday's** overnight schedule first, so 1 AM is still open for an 18:00 to 02:00 mall.
4. Otherwise checks today: open when `open <= now < close`.

`now` is a parameter, so tests never depend on the real clock.

**Verification:** 34 unit tests cover boundaries, overnight hours, missing or invalid hours, and a New York mall evaluated from a different timezone. The timezone conversion was also checked on a physical Android device (Hermes engine), not only in Node.

## Why MapLibre and not Google Maps

`react-native-maps` on Android uses the Google Maps SDK, which needs a Google Cloud project with a billing account and API key. Google rejected the default key inside Expo Go (`DEVELOPER_ERROR`, blank tiles). To avoid requiring a paid account, the app uses MapLibre, an open-source native map, with OpenStreetMap tiles. It is a native map component, not a WebView. The trade-off is that it needs a development build instead of Expo Go.

Platform differences from the web app (Leaflet):

| | Web (Leaflet) | Android (MapLibre) |
|---|---|---|
| Rendering | DOM and canvas | Native map view |
| Coordinates | `[lat, lng]` | `[lng, lat]` |
| Markers | HTML elements | React Native views |
| Zoom limits and bounds | `minZoom`, `maxBounds` on the map | Props on `Camera` |

## Assumptions and known limitations

- **Mock data:** malls beyond the three required India malls include demo entries.
- **OpenStreetMap tiles:** the public tile server is for light use and requires attribution. Fine for a demo, not for production traffic. A production app should use a tile provider with an SLA.
- **Development build vs. APK:** the development build needs a PC running Metro. Use the preview build for a standalone APK.
- **Nearest mall** requires location permission and GPS. It measures straight-line distance, not driving distance.
- **World repeat:** near the date line a sliver of the neighbouring world copy can still show, because `maxBounds` limits the view centre.
- **Not implemented:** marker clustering, holidays, dark mode, offline caching. With more time: clustering for large mall counts, a real REST repository with caching, a draggable bottom sheet, and image lazy loading.

## Scripts

| Command | Purpose |
|---|---|
| `npx expo start --dev-client` | Start Metro for the development build |
| `npx vitest run` | Run unit tests |
| `npx tsc --noEmit` | Type check |
| `npx eas-cli build --profile development --platform android` | Development build |
| `npx eas-cli build --profile preview --platform android` | Standalone APK |
