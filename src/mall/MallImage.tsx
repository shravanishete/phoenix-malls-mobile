import { ImageOff } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  Image,
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native'
import { getPoolImages } from '../utils/mallImages'

interface Props {
  src: string
  alt: string
  seed: string
}

export default function MallImage({
  src,
  alt,
  seed,
}: Props) {
  const sources: ImageSourcePropType[] = [
    ...(src?.startsWith('http') ? [{ uri: src }] : []),
    ...getPoolImages(seed),
  ]

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [src, seed])

  if (index >= sources.length) {
    return (
      <View style={styles.placeholder}>
        <ImageOff size={32} color="#9CA3AF" />

        <Text style={styles.placeholderText}>
          Image unavailable
        </Text>
      </View>
    )
  }

  const imageSource = sources[index]

  return (
    <Image
      source={imageSource}
      accessibilityLabel={alt}
      resizeMode="cover"
      style={styles.image}
      onLoad={() => {
        console.log('IMAGE LOADED:', imageSource)
      }}
      onError={(error) => {
        console.log(
          'IMAGE FAILED:',
          imageSource,
          error.nativeEvent
        )

        setIndex((prev) => prev + 1)
      }}
    />
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  placeholderText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
})