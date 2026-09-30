import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'

interface Props {
  color: string
  size?: number
  pulse?: boolean
}

const RING_SCALE = 2.4

export default function PulseDot({ color, size = 14, pulse = true }: Props) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!pulse) return
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse, anim])

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, RING_SCALE] })
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] })

  const box = size * RING_SCALE

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      {pulse && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity,
              transform: [{ scale }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  ring: { position: 'absolute' },
  dot: { borderWidth: 2, borderColor: '#fff', elevation: 3 },
})