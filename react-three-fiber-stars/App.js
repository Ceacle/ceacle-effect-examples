import {
  useRef,
  useEffect,
  useState,
} from 'react'
import { Points, PointMaterial, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as random from 'maath/random/dist/maath-random.esm'

import {
  setDefaultCamera,
  useCanvasProps,
  useControl,
} from './effect-control'

/* 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  const { setCanvasProps } = useCanvasProps()

  useEffect(() => {
    setCanvasProps({ flat: true })
  }, [])
  
  return (
    <>
      <PerspectiveCamera
        ref={setDefaultCamera}
        makeDefault
        position={[0, 0, 1]}
      />
      <Stars />
      <BackgroundColor />
    </>
  )
}

function Stars(props) {
  const ref = useRef()
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }))
  const { color, size, stride } = useControl({
    /* Unique id */
    id: 'stars-controls',
    /*
     * Color control
     * Accepts and returns any of the values below
     * hex: '#ffffff',
     * rgba: { r: 255, g: 255, b: 255, a: 1 },
     * hsla: { h: 360, s: 100, l: 100, a: 1 },
     */
    color: {
      label: 'Star Color',
      color: {
        hexa: '#FFFFD2B4',
      },
    },
    size: {
      label: 'Size',
      min: 0,
      max: 100,
      step: 0.1,
      value: 0.5,
    },
    stride: {
      label: 'Stride',
      min: 4,
      max: 100,
      value: 4,
    },
  })

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={stride}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color={color.hex}
          opacity={color.rgba.a}
          size={size/100}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function BackgroundColor() {
  const { backgroundColor: bc } = useControl({
    /* Unique id */
    id: 'background-controls',
    backgroundColor: {
      label: 'Background Color',
      color: {
        hexa: '#050B18FF',
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
