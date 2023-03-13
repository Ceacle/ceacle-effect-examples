import { useFrame } from '@react-three/fiber'

import { useControl } from './effect-control'

/* 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  const { color, count, image } = useControl({
    /* Unique id */
    id: 'main-controls',
    /*
     * Color control
     * Accepts and returns any of the values below
     * hex: '#ffffff',
     * rgba: { r: 255, g: 255, b: 255, a: 1 },
     * hsla: { h: 360, s: 100, l: 100, a: 1 },
     */
    color: {
      label: 'Color',
      color: {
        hexa: '#ffffffff',
      },
    },
    count: {
      label: 'Count',
      min: 0,
      max: 10,
      value: 1,
    },
    image: {
      label: 'Image',
      image: {
        src: '',
      }
    },
  })

  return (
    <>
      {/* Add your code */}
      <BackgroundColor />
    </>
  )
}

function BackgroundColor() {
  const { backgroundColor: bc } = useControl({
    /* Unique id */
    id: 'background-controls',
    backgroundColor: {
      label: 'Background Color',
      color: {
        hexa: '#00000000',
      },
    },
  })
  const clearColor = bc?.rgba
    ? `rgb(${bc?.rgba.r}, ${bc?.rgba.g}, ${bc?.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useFrame(({ gl }) => {
    gl.setClearColor(clearColor, alpha)
  })

  return null
}
