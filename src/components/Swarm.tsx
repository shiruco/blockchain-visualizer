import { useRef, useMemo } from 'react'
import { Object3D, InstancedMesh, PlaneGeometry, MeshBasicMaterial } from 'three'
import { useFrame } from '@react-three/fiber'

export default function Swarm({ count }: { count: number }) {
    const mesh = useRef({} as InstancedMesh)
    const light = useRef({} as any)
  
    const dummy = useMemo(() => new Object3D(), [])
    const particles = useMemo(() => {
      const temp = []
      for (let i = 0; i < count; i++) {
        const t = Math.random() * 100
        const factor = 20 + Math.random() * 100
        const speed = 0.01 + Math.random() / 200
        const xFactor = -50 + Math.random() * 100
        const yFactor = -50 + Math.random() * 100
        const zFactor = -50 + Math.random() * 100
        temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
      }
      return temp
    }, [count])
    
    useFrame(state => {
  
      particles.forEach((particle, i) => {
        let { t, factor, speed, xFactor, yFactor, zFactor } = particle
        t = particle.t += speed / 2
        const a = Math.cos(t) + Math.sin(t * 1) / 10
        const b = Math.sin(t) + Math.cos(t * 2) / 10
        const s = Math.cos(t) * 0.2
        particle.mx += particle.mx * 0.01
        particle.my += particle.my * 0.01
        
        dummy.position.set(
          (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
          (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
          (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
        )
        dummy.scale.set(s, s, s)
        
        dummy.updateMatrix()
        
        mesh.current.setMatrixAt(i, dummy.matrix)
      })
      mesh.current.instanceMatrix.needsUpdate = true
    })
    return (
      <>
        <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
        <instancedMesh ref={mesh} args={[new PlaneGeometry( 1, 1, 1 ), new MeshBasicMaterial(), count]}>
          <dodecahedronBufferGeometry attach="geometry" args={[0.2, 0]} />
          <meshPhongMaterial attach="material" color="#ccc" />
        </instancedMesh>
      </>
    )
  }