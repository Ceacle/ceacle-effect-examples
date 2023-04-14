import {
  useRef,
  useEffect,
  Suspense,
  useCallback,
} from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { LayerMaterial, Displace, Gradient, Fresnel, Normal } from 'lamina'

import {
  useCanvasProps,
  useControl,
  useDefaultCamera,
  useSettings,
} from './effect-control'

/**
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  const cameraRef = useRef()
  /**
   * Change the default camera the export will use
   * https://docs.effect.ceacle.com/hooks/useDefaultCamera
   */
  const { setDefaultCamera } = useDefaultCamera()
  /**
   * Change the Canvas props
   * https://docs.effect.ceacle.com/hooks/useCanvasProps
   */
  const { setCanvasProps } = useCanvasProps()
  /**
   * Use the useSettings hook to save and restore settings
   * without exposing them to the user.
   * https://docs.effect.ceacle.com/hooks/useSettings
   */
  const cameraSettings = useSettings('camera', {
    orbitTarget: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 50 },
    rotation: { _x: 0, _y: 0, _z: 0 },
  })
  const { orbitTarget, position, rotation } = cameraSettings

  useEffect(() => {
    setCanvasProps({ flat: true })
  }, [])

  function onControlEnd(event) {
    cameraSettings.update({
      orbitTarget: event.target.target,
      position: cameraRef.current.position,
      rotation: cameraRef.current.rotation,
    })
  }

  const handleCameraRef = useCallback((node) => {
    setDefaultCamera(node)
    cameraRef.current = node
  }, [])

  const handleOrbitRef = useCallback((node) => {
    if (!node) return
    node.target.x = orbitTarget.x
    node.target.y = orbitTarget.y
    node.target.z = orbitTarget.z
  }, [])
  
  return (
    <>
      <Suspense fallback={null}>
        <PerspectiveCamera
          ref={handleCameraRef}
          makeDefault
          position={[position.x, position.y, position.z]}
          rotation={[rotation._x, rotation._y, rotation._z]}
        />
        <OrbitControls
          ref={handleOrbitRef}
          onEnd={onControlEnd}
        />
        <Blob />
      </Suspense>
      <BackgroundColor />
    </>
  )
}

function Blob() {
  const displaceRef = useRef()
  const gl = useThree((state) => state.gl)
  const { scene } = useThree()
  const { camera } = useDefaultCamera()
  const { setCanvasProps } = useCanvasProps()

  /**
   * Use the useControl hook to receive the user's input 
   * from the control panel you created
   * https://docs.effect.ceacle.com/hooks/useControl
   */
  const {
    blobRadius,
    blobDetail,
  } = useControl('blob')

  const {
    color1,
    color2,
    gradientIntensity,
    gradient_blend,
    normalOpacity,
    overlay_blend,
  } = useControl('colors')

  const {
    color3,
    fresnelBias,
    fresnelOpacity,
    fresnelIntensity,
    fresnel_blend,
  } = useControl('fresnel')

  const {
    displaceOffset,
    displaceScale,
    displaceSpeed,
    displaceStrength,
  } = useControl('displace')

  useFrame((state) => {
    const { clock } = state
    const displace = displaceRef.current

    if (displace) {
      displace.scale = displaceScale
      displace.strength = displaceStrength

      if (displaceSpeed) {
        displace.offset.x = displaceSpeed * clock.getElapsedTime()
      } else {
        displace.offset.x = displaceOffset
      }   
    }
  })

  useEffect(() => {
    if (displaceSpeed) {
      setCanvasProps({ frameloop: 'always' })
    } else {
      setCanvasProps({ frameloop: 'demand' })
    }
  }, [displaceSpeed])

  useEffect(() => {
    if (displaceSpeed) return
    gl.render(scene, camera)
  }, [
    color1,
    color2,
    color3,
    blobRadius,
    blobDetail,
    displaceOffset,
    displaceScale,
    displaceSpeed,
    displaceStrength,
    fresnelBias,
    fresnelOpacity,
    fresnelIntensity,
    gradientIntensity,
    normalOpacity,
  ])

  return (
    <mesh
      position={[0, 0, 0]}
      // Prevent the blob to be culled when it's outside the camera frustum
      // It can make the blob invisible when it's partially visible
      frustumCulled={false}
    >
      <icosahedronGeometry args={[blobRadius, blobDetail]} />

      <LayerMaterial>
        <Displace
          ref={displaceRef}
          type={'perlin'}
        />
        <Gradient
          colorA={color1?.hex}
          colorB={color2?.hex}
          contrast={110}
          start={420}
          end={-420}
          alpha={1}
          axes={'y'}
        />
        <Fresnel
          color={color3?.hex}
          bias={fresnelBias}
          intensity={fresnelIntensity}
          alpha={fresnelOpacity}
          mode={fresnel_blend}
        />
        <Normal
          alpha={normalOpacity}
          direction={[1, 1, -1]}
          mode={overlay_blend}
        />
        <Gradient
          colorA={color1?.hex}
          colorB={color2?.hex}
          contrast={110}
          start={420}
          end={-420}
          alpha={gradientIntensity}
          axes={'x'}
          mode={gradient_blend}
        />
      </LayerMaterial>
    </mesh>
  )
}

function BackgroundColor() {
  const gl = useThree((state) => state.gl)
  const { scene } = useThree()
  const { camera } = useDefaultCamera()
  const { backgroundColor: bc } = useControl('background')

  const clearColor = bc?.rgba
    ? `rgb(${bc.rgba.r}, ${bc.rgba.g}, ${bc.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useEffect(() => {
    gl.setClearColor(clearColor, alpha)
    // Rendering on demand
    gl.render(scene, camera)
  }, [bc?.hexa])

  return null
}
