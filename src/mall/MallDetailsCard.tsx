
import {
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
  X,
} from 'lucide-react-native'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View ,useWindowDimensions} from 'react-native'

import { useNow } from '../hooks/useNow'
import { Mall } from '../types/mall'
import { getMallStatus } from '../logic/getMallStatus'
import { formatHoursRange } from '../utils/format'
import MallStatusBadge from './MallStatusBadge'
import MallImage from './MallImage'
interface Props {
  mall: Mall
  onClose: () => void
}

export default function MallDetailsCard({ mall, onClose }: Props) {
  const now = useNow()
  const { height: screenHeight } = useWindowDimensions()
  const { status, todayHours, reason } = getMallStatus(mall, now)

  const hoursText = todayHours
    ? formatHoursRange(todayHours.open, todayHours.close)
    : null

  const todayLabel =
    hoursText ??
    (reason === 'closed-today' ? 'Closed today' : 'Hours unavailable')

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${mall.latitude},${mall.longitude}`

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error('Unable to open URL:', error)
    }
  }

  return (
    <ScrollView
style={[styles.card, { maxHeight: screenHeight * 0.7 }]}      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <MallImage
          src={mall.image}
          alt={mall.name}
          seed={mall.id}
        />

        <Pressable
          onPress={onClose}
          accessibilityLabel="Close details"
          accessibilityRole="button"
          style={styles.closeButton}
        >
          <X size={20} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.details}>
        <View>
          <MallStatusBadge status={status} />

          <Text style={styles.title}>{mall.name}</Text>

          <Text style={styles.subtitle}>
            {mall.city}, {mall.country}
          </Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Clock size={18} color="#e11d48" />

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Today: </Text>
              {todayLabel}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={18} color="#e11d48" />

            <Text style={styles.infoText}>
              {mall.address}
            </Text>
          </View>

          {mall.phone && (
            <Pressable
              style={styles.infoRow}
              onPress={() =>
                openLink(`tel:${mall.phone!.replace(/\s/g, '')}`)
              }
            >
              <Phone size={18} color="#e11d48" />

              <Text style={styles.linkText}>
                {mall.phone}
              </Text>
            </Pressable>
          )}

          {mall.website && (
            <Pressable
              style={styles.infoRow}
              onPress={() => openLink(mall.website!)}
            >
              <Globe size={18} color="#e11d48" />

              <Text style={styles.linkText}>
                Visit website
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.directionsButton}
          onPress={() => openLink(directionsUrl)}
          accessibilityRole="button"
        >
          <Navigation size={18} color="#ffffff" />

          <Text style={styles.directionsText}>
            Get directions
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    // maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  content: {
    paddingBottom: 0,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 999,
    elevation: 4,
  },
  details: {
    padding: 20,
    gap: 18,
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#374151',
  },
  bold: {
    fontWeight: '600',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#e11d48',
    textDecorationLine: 'underline',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  directionsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})
