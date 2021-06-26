import React, { useRef, useMemo, useEffect } from 'react'
import { extend, ReactThreeFiber, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
extend({ OrbitControls })

export default function Controls(props: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>) {

  const {
    camera,
    gl: { domElement }
  } = useThree()

  // camera.position.set(2, 3, 4)

  const controls = useRef({} as OrbitControls)

  useFrame(({ clock }) => {
    //controls.current.object.position.y += 1
    //console.log(controls.current.object.position)
    console.log(clock.getElapsedTime())
    controls.current.update()
  })

  return <orbitControls {...props} ref={controls} args={[camera, domElement]} />
}