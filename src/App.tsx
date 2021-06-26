import React, { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Object3D, InstancedMesh, PlaneGeometry, MeshBasicMaterial, SphereGeometry, BoxGeometry } from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { a } from '@react-spring/three'
import { SpringValue, useSpring, animated, config } from 'react-spring'
import { Stats } from '@react-three/drei'
import styled from 'styled-components'
import useInterval from 'use-interval'
import Box from './components/Box'
import useYScroll from './helpers/useYScroll'

function Swarm({ count }: { count: number }) {
  const mesh = useRef({} as InstancedMesh)
  const light = useRef({} as any)
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

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


export default function App() {
  
  // tick
  const [tick, setTick] = useState(0)
  useInterval(() => {
    setTick(tick + 1)
  }, 1000)

  // scroll
  const [dis, delta] = useYScroll([-3800, 0], { domTarget: window })
  let posX = (dis as SpringValue<number>).to((dis: number) => (dis / 1000) * 25 * -1)

  const [bgStyle, setBgColor] = useSpring(() => ({
    width: "100vw",
    height: "100vh",
    background: "radial-gradient(ellipse at 50% -100%, #222222 0%, #a4a2a2 99%)",
  }))

  function CameraPosition() {
    const { camera } = useThree()
    useEffect(() => {
      const angle = (delta as number) / 2000 * -1
      camera.rotation.x = angle
      camera.rotation.y = angle
      camera.rotation.z = angle
    }, [delta])

    return null
  }

  const onHoverOverBox = useCallback(() => {
    setBgColor({
      background: "radial-gradient(ellipse at 50% -100%, #222222 0%, #2c2c2c 99%)",
      config: config.slow
    })
  }, [])

  const onHoverOutBox = useCallback(() => {
    setBgColor({
      background: "radial-gradient(ellipse at 50% -100%, #222222 0%, #a4a2a2 99%)",
      config: config.slow
    })
  }, [])

  return (
    <animated.div style={bgStyle}>
      <Canvas camera={{position: [0,0,5], fov: 60}} >
        <CameraPosition />
        <ambientLight />
        <pointLight distance={100} intensity={1} position={[0, -50, 10]} color="#ccc" />
        <Suspense fallback={null}>
          <a.group position-x={posX}>
            { [...Array(20)].map((_, i) => {
              return (
                <Box key={i} index={i} position={[-5 * i, 0, 0]} tick={tick} onHoverOver={onHoverOverBox} onHoverOut={onHoverOutBox}/>
              )
            }) }
          </a.group>
        </Suspense>
        <Swarm count={1500} />
        <Stats />
      </Canvas>
    </animated.div>
  )
}

// const Container = animated(styled.div)`
//   width: 100vw;
//   height: 100vh;
//   //background: radial-gradient(ellipse at 50% -150%, #414141 0%, #dddddd 99%);
//   //background: radial-gradient(ellipse at 50% -100%, #222222 0%, #a4a2a2 99%);
//   //background: radial-gradient(ellipse at 50% -100%, #020b14 0%, #0c2947 99%);
// `