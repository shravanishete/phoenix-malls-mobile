import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { mallService } from '../src/services/mallService'
import { useAsync } from '../src/hooks/useAsync'
import { useNow } from '../src/hooks/useNow'
import { getMallStatus } from '../src/logic/getMallStatus'

const loadMalls = () => mallService.getAllMalls()

export default function MallListScreen() {
  const { state, retry } = useAsync(loadMalls)
  const now = useNow()

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
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={state.data}
        keyExtractor={(mall) => mall.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item: mall }) => {
          const { status } = getMallStatus(mall, now)
          const localTime = now.setZone(mall.timezone).toFormat('ccc h:mm a')
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{mall.name}</Text>
              <Text style={styles.sub}>{mall.city}, {mall.country}</Text>
              <Text style={styles.sub}>Local time: {localTime}</Text>
              <Text style={[styles.badge, status === 'open' ? styles.open : status === 'closed' ? styles.closed : styles.unknown]}>
                {status.toUpperCase()}
              </Text>
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  error: { color: '#b00020', fontSize: 16 },
  retry: { color: '#0a66c2', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 4 },
  name: { fontSize: 17, fontWeight: '600' },
  sub: { color: '#555' },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', fontWeight: '700', color: '#fff' },
  open: { backgroundColor: '#1a8f3c' },
  closed: { backgroundColor: '#c62828' },
  unknown: { backgroundColor: '#757575' },
})