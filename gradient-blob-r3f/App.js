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
  setDefaultCamera,
  useCanvasProps,
  useControl,
  useDefaultCamera,
  useSettings,
} from './effect-control'

/* 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  const cameraRef = useRef()
  const { setCanvasProps } = useCanvasProps()
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
          fov={75}
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
  const camera = useDefaultCamera()
  const { setCanvasProps } = useCanvasProps()

  const {
    blobRadius,
    blobDetail,
  } = useControl({
    /* Unique id */
    id: 'blob',
    label: 'Blob',
    blobRadius: {
      label: 'Radius',
      min: .1,
      max: 10,
      step: .1,
      value: 2.0,
    },
    blobDetail: {
      label: 'Detail',
      warnings: {
        intensive: {
          valueGt: 48,
        },
      },
      min: 0,
      max: 64,
      step: 1,
      value: 16,
    },
  })

  const {
    color1,
    color2,
    gradientIntensity,
    normalOpacity,
  } = useControl({
    /* Unique id */
    id: 'colors',
    label: 'Colors',
    /*
     * Color control
     * Accepts and returns any of the values below
     * hex: '#ffffff',
     * rgba: { r: 255, g: 255, b: 255, a: 1 },
     * hsla: { h: 360, s: 100, l: 100, a: 1 },
     */
    color1: {
      label: 'Color 1',
      color: {
        hex: '#27F6FF',
      },
    },
    color2: {
      label: 'Color 2',
      color: {
        hex: '#FFB822',
      },
    },
    gradientIntensity: {
      label: 'Gradient Intensity',
      min: 0,
      max: 5,
      step: .01,
      value: 1.2,
    },
    normalOpacity: {
      label: 'Overlay Opacity',
      min: 0,
      max: 3,
      step: .01,
      value: .37,
    },
  })

  const {
    color3,
    fresnelBias,
    fresnelOpacity,
    fresnelIntensity,
  } = useControl({
    /* Unique id */
    id: 'contour',
    label: 'Contour',
    color3: {
      label: 'Color',
      color: {
        hex: '#30FF00',
      },
    },
    fresnelBias: {
      label: 'Bias',
      min: -1,
      max: 1,
      step: .1,
      value: .5,
    },
    fresnelIntensity: {
      label: 'Intensity',
      min: 0,
      max: 100,
      step: 1,
      value: 35,
    },
    fresnelOpacity: {
      label: 'Opacity',
      min: 0,
      max: 3,
      step: .01,
      value: .12,
    },
  })

  const {
    displaceOffset,
    displaceScale,
    displaceSpeed,
    displaceStrength,
  } = useControl({
    /* Unique id */
    id: 'displace',
    label: 'Displace',
    displaceOffset: {
      label: 'Offset',
      min: 0,
      max: 100,
      step: 0.1,
      value: 1,
    },
    displaceScale: {
      label: 'Scale',
      min: 0.1,
      max: 10,
      step: 0.1,
      value: 0.6,
    },
    displaceStrength: {
      label: 'Strength',
      min: 1,
      max: 50,
      step: 1,
      value: 38,
    },
    displaceSpeed: {
      label: 'Speed',
      min: -3,
      max: 3,
      step: .01,
      value: .08,
    },
  })

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
    >
      <icosahedronGeometry args={[blobRadius, blobDetail]} />

      <LayerMaterial>
        <Displace
          ref={displaceRef}
          type={'perlin'}
        />
        <Gradient
          colorA={color1.hex}
          colorB={color2.hex}
          contrast={110}
          start={420}
          end={-420}
          alpha={1}
          axes={'y'}
        />
        <Fresnel
          color={color3.hex}
          bias={fresnelBias}
          intensity={fresnelIntensity}
          alpha={fresnelOpacity}
        />
        <Normal
          alpha={normalOpacity}
          direction={[1, 1, -1]}
          mode={'overlay'}
        />
        <Gradient
          colorA={color1.hex}
          colorB={color2.hex}
          contrast={110}
          start={420}
          end={-420}
          alpha={gradientIntensity}
          axes={'y'}
          mode={'overlay'}
        />
      </LayerMaterial>
    </mesh>
  )
}

function BackgroundColor() {
  const gl = useThree((state) => state.gl)
  const { scene } = useThree()
  const camera = useDefaultCamera()

  const { backgroundColor: bc } = useControl({
    /* Unique id */
    id: '0-background-controls',
    backgroundColor: {
      label: 'Background Color',
      color: {
        hexa: '#00000000',
      },
    },
  })

  const clearColor = bc?.rgba
    ? `rgb(${bc.rgba.r}, ${bc.rgba.g}, ${bc.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useEffect(() => {
    gl.setClearColor(clearColor, alpha)
    gl.render(scene, camera) // Rendering on demand
  }, [bc.hexa])

  return null
}
