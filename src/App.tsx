import React, { Suspense, useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { Canvas, useThree, Euler, useFrame, ReactThreeFiber } from 'react-three-fiber'
import { Mesh } from 'three'
import { SpringValue, useSpring, config } from '@react-spring/core'
import { a } from '@react-spring/three'
import styled from 'styled-components'
import useInterval from 'use-interval'
import _ from 'lodash'
import SampleBox from './components/SampleBox'
import useYScroll from './helpers/useYScroll'

export default function App() {
  // tick
  const [tick, setTick] = useState(0)
  useInterval(() => {
    setTick(tick + 1)
  }, 1000)

  // scroll
  const [dis, delta] = useYScroll([-2000, 0], { domTarget: window })
  let posX = (dis as SpringValue<number>).to((dis: number) => (dis / 1000) * 25 * -1)

  function Test() {
    const camera = useThree(state => state.camera)
    useEffect(() => {
      const angle = (delta as number) / 2000 * -1
      //   console.log(angle)
      // camera.rotation.x = angle
      // camera.rotation.y = angle
      // camera.rotation.z = angle
    }, [delta])

    useFrame(({clock}) => {
      //console.log(clock)
    })



    return null
  }

  return (
    <Container>
      <Canvas camera={{position: [0,0,5], fov: 60}}>
        <color attach="background" args={["gray"]} />
        {/* <fog attach="fog" args={['#cc7b32', 0, 500]} /> */}
        <Test />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <a.group position-x={posX}>
            <SampleBox key={1} position={[-50,0,0]} tick={tick}/>
            <SampleBox key={2} position={[-45,0,0]} tick={tick}/>
            <SampleBox key={3} position={[-40,0,0]} tick={tick}/>
            <SampleBox key={4} position={[-35,0,0]} tick={tick}/>
            <SampleBox key={5} position={[-30,0,0]} tick={tick}/>
            <SampleBox key={6} position={[-25,0,0]} tick={tick}/>
            <SampleBox key={7} position={[-20,0,0]} tick={tick}/>
            <SampleBox key={8} position={[-15,0,0]} tick={tick}/>
            <SampleBox key={9} position={[-10,0,0]} tick={tick}/>
            <SampleBox key={10} position={[-5,0,0]} tick={tick}/>
            <SampleBox key={11} position={[0,0,0]}  tick={tick}/>
          </a.group>
          {/* <Controls enableZoom={false} autoRotate={true} maxDistance={20} maxPolarAngle={Math.PI * 0.45} enableDamping={true} /> */}
          {/* <gridHelper /> */}
        </Suspense>
      </Canvas>
    </Container>
  )
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`