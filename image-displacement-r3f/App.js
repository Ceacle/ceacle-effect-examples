import {
  useRef,
  useEffect,
  Suspense,
} from 'react'
import { shaderMaterial } from '@react-three/drei'
import { useThree, extend } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'

import { useControl, useCanvasProps } from './effect-control'

const RemapShaderMaterial = shaderMaterial(
  {
    uIntensity: 0.5,
    uBaseMap: null,
    uDispMap: null,
    uDirection: 0,
    uReverse: 0,
  },
  `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  `
    varying vec2 vUv;

    uniform sampler2D uBaseMap;
    uniform float uIntensity;
    uniform sampler2D uDispMap;
    uniform int uDirection;
    uniform int uReverse;

    void main() {
      vec2 uv = vUv;
      vec4 dispMapVec = texture2D(uDispMap, uv);
      float reverse = uReverse == 0 ? -1.0 : 1.0;
      float intensity = uIntensity * reverse;
      vec4 displacedMap = vec4(0.0);
      int vertical = 0;
      int horizontal = 1;
      int diagonal = 2;

      if (uDirection == vertical) {
        displacedMap = texture2D(uBaseMap, vec2(uv.x, uv.y + intensity * dispMapVec.r));
        
      } else if (uDirection == horizontal) {
        displacedMap = texture2D(uBaseMap, vec2(uv.x + intensity * dispMapVec.r, uv.y));

      } else if (uDirection == diagonal) {
        displacedMap = texture2D(uBaseMap, vec2(uv.x + intensity * dispMapVec.r, uv.y + intensity * dispMapVec.g));
      }

      gl_FragColor = displacedMap;
    }
  `,
)

extend({ RemapShaderMaterial })


/**
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App({
}) {
  /**
   * Change the Canvas props
   * https://docs.effect.ceacle.com/hooks/useCanvasProps
   */
  const { setCanvasProps } = useCanvasProps()

  useEffect(() => {
    setCanvasProps({ flat: true, frameloop: 'demand' })
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <ImageDisplacement />
      </Suspense>

      <BackgroundColor />
    </>
  )
}

function ImageDisplacement() {
  const materialRef = useRef(null)
  const loader = new TextureLoader()
  const { viewport, scene, camera } = useThree()
  const gl = useThree((state) => state.gl)

  /**
   * Use the useControl hook to receive the user's input 
   * from the control panel you created
   * https://docs.effect.ceacle.com/hooks/useControl
   */
  const {
    intensity,
    baseMap,
    displacementMap,
    reverse,
    direction,
  } = useControl('displacement')

  function loadMap (key, src) {
    loader.load(src, (loadedTexture) => {
      materialRef.current[key] = loadedTexture
      gl.render(scene, camera) // Rendering on demand
    },
    undefined,
    (err) => {
      console.error('Loading texture error:', err.message)
    })
  }

  useEffect(() => {
    if (!baseMap?.src || !materialRef.current) return
    loadMap('uBaseMap', baseMap.src)
  }, [baseMap])

  useEffect(() => {
    if (!displacementMap?.src || !materialRef.current) return
    loadMap('uDispMap', displacementMap.src)
  }, [displacementMap])

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uReverse = reverse ? 1 : 0
  }, [reverse])

  useEffect(() => {
    if (!materialRef.current) return

    if (direction === 'Vertical') {
      materialRef.current.uDirection = 0

    } else if (direction === 'Horizontal') {
      materialRef.current.uDirection = 1
      
    } else if (direction === 'Diagonal') {
      materialRef.current.uDirection = 2
    }
  }, [direction])

  return (
    <mesh>
      <planeGeometry
        args={[viewport?.width || 0, viewport?.height || 0]}
        attach="geometry"
      />
      <remapShaderMaterial
        ref={materialRef}
        attach='material'
        uIntensity={intensity / 1000}
        uBaseMap={null}
        uDispMap={null}
        uDirection={direction}
        uReverse={reverse ? 1 : 0}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

function BackgroundColor() {
  const { scene, camera } = useThree()
  const gl = useThree((state) => state.gl)
  const { backgroundColor: bc } = useControl('background')

  const clearColor = bc?.rgba
    ? `rgb(${bc.rgba.r}, ${bc.rgba.g}, ${bc.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useEffect(() => {
    gl.setClearColor(clearColor, alpha)
    gl.render(scene, camera) // Rendering on demand
  }, [bc?.hexa])

  return null
}
