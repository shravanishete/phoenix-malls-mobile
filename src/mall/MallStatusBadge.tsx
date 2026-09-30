
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  status: string
}

export default function MallStatusBadge({ status }: Props) {
  const isOpen = status.toLowerCase() === 'open'

  const label = isOpen ? 'Open Now' : 'Closed'

  return (
    <View
      style={[
        styles.badge,
        isOpen ? styles.openBadge : styles.closedBadge,
      ]}
    >
      <View
        style={[
          styles.dot,
          isOpen ? styles.openDot : styles.closedDot,
        ]}
      />

      <Text
        style={[
          styles.label,
          isOpen ? styles.openText : styles.closedText,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#fee2e2',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  openDot: {
    backgroundColor: '#16a34a',
  },
  closedDot: {
    backgroundColor: '#dc2626',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#166534',
  },
  closedText: {
    color: '#991b1b',
  },
})
