import { useFrame } from '@react-three/fiber'

export default function CameraRig() {
  useFrame((state, delta) => {
    const x = state.pointer.x * 0.8
    const y = state.pointer.y * 0.4 + 0.2
    const k = Math.min(1, delta * 2)
    state.camera.position.x += (x - state.camera.position.x) * k
    state.camera.position.y += (y - state.camera.position.y) * k
    state.camera.lookAt(0, 0, 0)
  })
  return null
}
