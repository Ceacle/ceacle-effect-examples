import { useFrame } from '@react-three/fiber'

import { useControl } from './effect-control'

/** 
 * App is inside a Canvas from "@react-three/fiber"
 */
export default function App() {
  /*
   * Use the useControl hook to receive the user's input 
   * from the control panel you created
   * https://docs.effect.ceacle.com/hooks/useControl
   */
  const { color, count, image } = useControl('main-controls')

  return (
    <>
      {/* Add your code */}
      <BackgroundColor />
    </>
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
