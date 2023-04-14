import {
  useRef,
  useEffect,
  useState,
} from 'react'
import { Points, PointMaterial, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as random from 'maath/random/dist/maath-random.esm'

import {
  useCanvasProps,
  useControl,
  useDefaultCamera,
} from './effect-control'

/** 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  /**
   * Change the Canvas props
   * https://docs.effect.ceacle.com/hooks/useCanvasProps
   */
  const { setCanvasProps } = useCanvasProps()
  /**
   * Change the default camera the export will use
   * https://docs.effect.ceacle.com/hooks/useDefaultCamera
   */
  const { setDefaultCamera } = useDefaultCamera()

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
  /**
   * Use the useControl hook to receive the user's input 
   * from the control panel you created
   * https://docs.effect.ceacle.com/hooks/useControl
   */
  const { color, size, stride } = useControl('stars-controls')

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
          color={color?.hex}
          opacity={color?.rgba?.a}
          size={size/100}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function BackgroundColor() {
  const { backgroundColor: bc } = useControl('background')

  const clearColor = bc?.rgba
    ? `rgb(${bc?.rgba.r}, ${bc?.rgba.g}, ${bc?.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useFrame(({ gl }) => {
    gl.setClearColor(clearColor, alpha)
  })

  return null
}
