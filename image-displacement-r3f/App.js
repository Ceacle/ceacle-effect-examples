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

    void main() {
      vec2 uv = vUv;
      vec4 dispMapVec = texture2D(uDispMap, uv);
      vec4 displacedMap = texture2D(uBaseMap, vec2(uv.x, uv.y + uIntensity * (dispMapVec * uIntensity)));

      gl_FragColor = displacedMap;
    }
  `,
)

extend({ RemapShaderMaterial })

/* 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App({
}) {
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

  const { intensity, baseMap, displacementMap } = useControl({
    /* Unique id */
    id: 'displacement-controls',
    intensity: {
      label: 'Intensity',
      min: 0,
      max: 1,
      step: .01,
      value: .15,
    },
    baseMap: {
      label: 'Image',
      // Resize the viewport to the image size when the image is loaded
      resizeViewport: true,
      image: {
        src: 'https://effect.ceacle.net/templates/image-displacement-r3f/base-3.png',
      },
    },
    displacementMap: {
      label: 'Displacement Image',
      image: {
        src: 'https://effect.ceacle.net/templates/image-displacement-r3f/artwork-2.jpg',
      },
    },
  })

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
    loadMap('uBaseMap', baseMap?.src)
  }, [baseMap])

  useEffect(() => {
    if (!displacementMap?.src || !materialRef.current) return
    loadMap('uDispMap', displacementMap?.src)
  }, [displacementMap])

  useEffect(() => {
    gl.render(scene, camera) // Rendering on demand
  }, [intensity])

  return (
    <mesh>
      <planeGeometry
        args={[viewport?.width, viewport?.height]}
        attach="geometry"
      />
      <remapShaderMaterial
        ref={materialRef}
        attach='material'
        uIntensity={intensity}
        uBaseMap={null}
        uDispMap={null}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

function BackgroundColor() {
  const { scene, camera } = useThree()
  const gl = useThree((state) => state.gl)

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
    ? `rgb(${bc.rgba.r}, ${bc.rgba.g}, ${bc.rgba.b})`
    : 'rgb(0, 0, 0)'
  const alpha = bc?.rgba.a ?? 0

  useEffect(() => {
    gl.setClearColor(clearColor, alpha)
    gl.render(scene, camera) // Rendering on demand
  }, [bc.hexa])

  return null
}
