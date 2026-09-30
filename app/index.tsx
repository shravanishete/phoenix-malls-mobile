import type { ElementRef } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View,ScrollView
} from 'react-native'
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native'
import { mallService } from '../src/services/mallService'
import { useAsync } from '../src/hooks/useAsync'
import { useMalls } from '../src/hooks/useMalls'
import { useNow } from '../src/hooks/useNow'
import { getMallStatus } from '../src/logic/getMallStatus'
import { filterMallsByStatus, type StatusFilter } from '../src/logic/filterMallsByStatus'
import { formatHoursRange } from '../src/utils/format'
import type { Country } from '../src/types/country'
import type { Mall } from '../src/types/mall'
import { OSM_STYLE, WORLD_CENTER, WORLD_ZOOM, MIN_ZOOM, MAX_ZOOM, WORLD_BOUNDS } from '../src/map/mapConfig'
import MallDetailsCard from '../src/mall/MallDetailsCard'
import PulseDot from '../src/mall/PulseDot'
import * as Location from 'expo-location'
import { findNearestMall } from '../src/logic/findNearestMall'
const loadCountries = () => mallService.getCountries()

const STATUS_COLOR: Record<string, string> = {
  open: '#16a34a',
  closed: '#dc2626',
  unavailable: '#6b7280',
}

export default function WorldMapScreen() {
  const { state, retry } = useAsync(loadCountries)
  const [selected, setSelected] = useState<Country | null>(null)
  const [selectedMall, setSelectedMall] = useState<Mall | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Mall[]>([])
  const cameraRef = useRef<ElementRef<typeof Camera>>(null)
  const now = useNow()
    const [menuOpen, setMenuOpen] = useState(false)
  const countries = state.status === 'success' ? state.data : []
  const { state: mallsState, retry: retryMalls } = useMalls(selected?.code ?? null)
  const allMalls = mallsState.status === 'success' ? mallsState.data : []
  const malls = filterMallsByStatus(allMalls, filter, now)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    const id = setTimeout(() => {
      mallService.searchMalls(q).then(setSearchResults).catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  const flyTo = (center: [number, number], zoom: number) => {
    cameraRef.current?.flyTo({ center, zoom, duration: 1200 })
  }

  const selectCountry = (country: Country) => {
    setSelected(country)
    setSelectedMall(null)
    flyTo([country.longitude, country.latitude], country.zoom)
  }

  const backToWorld = () => {
  setSelected(null)
  setSelectedMall(null)
  setFilter('all')
  setQuery('')
  setMenuOpen(false)
  flyTo(WORLD_CENTER, WORLD_ZOOM)
}

const selectMallFromSearch = (mall: Mall) => {
  const country = countries.find((c) => c.code === mall.countryCode)
  if (country) {
    setSelected(country)
  }
  setSelectedMall(mall)
  setQuery('')
  setMenuOpen(false)
  flyTo([mall.longitude, mall.latitude], 12)
}

const openMall = (mall: Mall) => {
  setSelectedMall(mall)
  setMenuOpen(false)
  flyTo([mall.longitude, mall.latitude], 12)
}

const toggleMenu = () => {
  setMenuOpen((open) => !open)
  setSelectedMall(null)
}

 const handleNearestMall = async () => {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert(
        'Location permission required',
        'Please allow location access to find the nearest mall.',
      )
      return
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

    const userLat = location.coords.latitude
    const userLng = location.coords.longitude

    const allMalls = await mallService.getAllMalls()

    if (!allMalls || allMalls.length === 0) {
      Alert.alert(
        'No malls found',
        'There are no malls available.',
      )
      return
    }

    const getDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const toRad = (value: number) =>
        (value * Math.PI) / 180

      const dLat = toRad(lat2 - lat1)
      const dLon = toRad(lon2 - lon1)

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2

      return (
        6371 *
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a),
        )
      )
    }

    const nearestMall = allMalls.reduce(
      (nearest, mall) => {
        const distance = getDistance(
          userLat,
          userLng,
          mall.latitude,
          mall.longitude,
        )

        return !nearest || distance < nearest.distance
          ? { mall, distance }
          : nearest
      },
      null as {
        mall: Mall
        distance: number
      } | null,
    )

    if (!nearestMall) {
      Alert.alert('No malls found')
      return
    }

    const country = countries.find(
      (c) => c.code === nearestMall.mall.countryCode,
    )

    if (!country) {
      Alert.alert(
        'Country not found',
        'Could not find the country for this mall.',
      )
      return
    }

    setSelected(country)
    setSelectedMall(nearestMall.mall)
    setMenuOpen(false)

    Alert.alert(
      'Nearest mall found',
      `${nearestMall.mall.name}\n${nearestMall.distance.toFixed(1)} km away`,
    )
  } catch (error) {
    console.error('Nearest mall error:', error)

    Alert.alert(
      'Location error',
      'Unable to find the nearest mall. Please try again.',
    )
  }
}

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{state.error.message}</Text>
        <Text style={styles.retry} onPress={retry}>Tap to retry</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={OSM_STYLE}>
        <Camera
  ref={cameraRef}
  initialViewState={{ center: WORLD_CENTER, zoom: WORLD_ZOOM }}
  minZoom={MIN_ZOOM}
  maxZoom={MAX_ZOOM}
  maxBounds={WORLD_BOUNDS}
/>

    {!selected &&
  countries.map((country) => (
    <Marker
      key={country.code}
      id={country.code}
      lngLat={[country.longitude, country.latitude]}
      onPress={() => selectCountry(country)}
    >
      <View
        style={[
          styles.countryMarkerWrapper,
          country.labelSide === 'left'
            ? styles.countryMarkerLabelLeft
            : styles.countryMarkerLabelRight,
        ]}
      >
        <Image
          source={require('../assets/images/logo_map1.png')}
          style={styles.countryLogo}
          resizeMode="contain"
        />

        <View style={styles.countryLabel}>
          <Text style={styles.countryLabelText}>
            {country.name}
          </Text>
        </View>
      </View>
    </Marker>
  ))}
       
        {selected && malls.map((mall) => {
          const status = getMallStatus(mall, now).status
          return (
                        <Marker
              key={mall.id}
              id={mall.id}
              lngLat={[mall.longitude, mall.latitude]}
              onPress={() => {
                setSelectedMall(mall)
                setMenuOpen(false)
              }}
            >
              <PulseDot
                color={STATUS_COLOR[status]}
                size={22}
                pulse={status === 'open'}
              />
            </Marker>
          )
        })}
      </Map>

<View style={styles.topOverlay} pointerEvents="box-none">
 <View style={styles.header}>
  <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
  <View style={styles.headerDivider} />
  <View>
    <Text style={styles.headerTitle}>Global Malls</Text>
    <Text style={styles.headerSubtitle}>LIVE STATUS MAP</Text>
  </View>
</View>

  <View style={styles.buttonRow}>
    <Pressable style={styles.menuButton} onPress={toggleMenu}>
      <Text style={styles.menuButtonText}>{menuOpen ? '✕' : '☰'}</Text>
    </Pressable>
   {selected && (
  <Pressable style={styles.backButton} onPress={backToWorld}>
    <Text style={styles.backArrow}>←</Text>
    <Text style={styles.backButtonText}>Back to world</Text>
  </Pressable>
)}
  </View>

  {menuOpen && (
    <ScrollView
      style={styles.menuPanel}
      contentContainerStyle={styles.menuContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search malls or cities"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {query.trim().length >= 2 && (
        searchResults.length === 0 ? (
          <Text style={styles.emptyText}>No malls match your search.</Text>
        ) : (
          searchResults.slice(0, 6).map((mall) => (
            <Pressable key={mall.id} style={styles.mallRow} onPress={() => selectMallFromSearch(mall)}>
              <Text style={styles.mallName}>{mall.name}</Text>
              <Text style={styles.mallCity}>{mall.city}, {mall.country}</Text>
            </Pressable>
          ))
        )
      )}

      <Pressable style={styles.nearestButton} onPress={handleNearestMall}>
        <Text style={styles.nearestButtonText}>Nearest mall to me</Text>
      </Pressable>

      {selected && (
        <View style={styles.filterBar}>
          {(['all', 'open', 'closed'] as StatusFilter[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                {f === 'all' ? 'All' : f === 'open' ? 'Open now' : 'Closed'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {selected && query.trim().length < 2 && (
        <View>
          <Text style={styles.listTitle}>Phoenix Malls in {selected.name}</Text>

          {mallsState.status === 'loading' && <ActivityIndicator style={styles.listLoading} />}

          {mallsState.status === 'error' && (
            <View>
              <Text style={styles.error}>{mallsState.error.message}</Text>
              <Text style={styles.retry} onPress={retryMalls}>Tap to retry</Text>
            </View>
          )}

          {mallsState.status === 'success' && malls.length === 0 && (
            <Text style={styles.emptyText}>No malls match this filter.</Text>
          )}

          {mallsState.status === 'success' && malls.map((mall) => (
            <Pressable key={mall.id} style={styles.mallRow} onPress={() => openMall(mall)}>
              <Text style={styles.mallName}>{mall.name}</Text>
              <Text style={styles.mallCity}>{mall.city}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  )}
</View>

    
{selectedMall && (
  <View style={styles.detailsPanel}>
    <MallDetailsCard
      mall={selectedMall}
      onClose={() => setSelectedMall(null)}
    />
  </View>
)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  error: { color: '#b00020', fontSize: 14 },
  retry: { color: '#0a66c2', fontSize: 14, marginTop: 4 },

  markerWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e11d48', borderWidth: 2, borderColor: '#fff', elevation: 2 },
  label: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  labelText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  mallDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff', elevation: 3 },

  topOverlay: { position: 'absolute', top: 48, left: 16, right: 16, gap: 10 },
 header: {
  flexDirection: 'row', alignItems: 'center', gap: 25,
  backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 4,
},
  logo: { width: 120, height: 60 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, fontWeight: '700', color: '#e11d48' },

  searchInput: { height: 44, fontSize: 14 },
  searchResults: { backgroundColor: '#fff', borderRadius: 16, padding: 8, elevation: 4, maxHeight: 220 },

  nearestButton: {
    backgroundColor: '#e11d48', borderRadius: 999, paddingVertical: 12,
    alignItems: 'center', elevation: 4,
  },
  nearestButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

//   backButton: {
//     alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 14,
//     paddingVertical: 10, borderRadius: 10, elevation: 4,
//   },
  backButtonText: { fontSize: 14, fontWeight: '600' },

  filterBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 999, padding: 4, elevation: 4, gap: 4 },
  filterButton: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#e11d48' },
  filterButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  filterButtonTextActive: { color: '#fff' },

  listPanel: {
    position: 'absolute', left: 16, right: 16, bottom: 32, maxHeight: '40%',
    backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 6,
  },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  listLoading: { marginTop: 8 },
  emptyText: { color: '#6b7280', fontSize: 14, paddingVertical: 6 },
  list: { flexGrow: 0 },
  mallRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  mallName: { fontSize: 14, fontWeight: '600' },
  mallCity: { fontSize: 12, color: '#6b7280', marginTop: 2 },

detailsPanel: { position: 'absolute', left: 16, right: 16, bottom: 60 },
closeButton: { position: 'absolute', top: 12, right: 12, padding: 6 },
  closeButtonText: { fontSize: 16, color: '#6b7280' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, gap: 6, marginBottom: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailsName: { fontSize: 18, fontWeight: '700' },
  detailsCity: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  detailsRow: { fontSize: 13, color: '#374151', marginBottom: 6 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
menuButton: {
  width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff',
  alignItems: 'center', justifyContent: 'center', elevation: 4,
},
menuButtonText: { fontSize: 20, fontWeight: '700', color: '#111827' },
menuPanel: { backgroundColor: '#fff', borderRadius: 16, elevation: 6, maxHeight: 420 },
menuContent: { padding: 12, gap: 10 },
searchBox: { backgroundColor: '#f3f4f6', borderRadius: 999, paddingHorizontal: 16 },
backButton: {
  flexDirection: 'row', alignItems: 'center', gap: 8,
  backgroundColor: '#fff', paddingHorizontal: 14, height: 44,
  borderRadius: 12, elevation: 4,
},
backArrow: { fontSize: 30, lineHeight: 26, fontWeight: '700', color: '#111827',paddingBottom: 12,
  includeFontPadding: false, },
  headerDivider: { width: 1, height: 44, backgroundColor: '#e5e7eb' },
 // Country logo marker
countryMarkerWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

countryMarkerLabelLeft: {
  flexDirection: 'row-reverse',
},

countryMarkerLabelRight: {
  flexDirection: 'row',
},

countryLogo: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#ffffff',
  borderWidth: 2,
  borderColor: '#ffffff',
  elevation: 4,
},

countryLabel: {
  backgroundColor: '#30487c',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 6,
  elevation: 4,
},

countryLabelText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '600',
},

})