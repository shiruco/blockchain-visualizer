import React, { useRef, useCallback, useEffect, useState } from 'react'
import { ReactThreeFiber, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { Mesh } from 'three'
import { a } from '@react-spring/three'
import { SpringValue, useSpring, config } from '@react-spring/core'
import { useFrame } from 'react-three-fiber'

type BoxProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh> & {
  tick?: number
}

export default function SampleBox(props: BoxProps) {

  // const {
  //   camera,
  //   gl: { domElement }
  // } = useThree()

  // camera.position.set(2, 3, 4)

  //console.log(props.tick)
  const [hoverd, setHoverd] = useState(false)

  const ref = useRef({} as Mesh)
  // useFrame(() => {
  //   setTimeout(() => {
  //     ref.current.rotation.x += 0.1
  //   }, 1000)
  // })

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: 0
  }))

  useEffect(() => {
    if (hoverd) return
    const r = rotation.get() + Math.PI
    setRotation({
      rotation: Math.trunc(r),
      config: { mass: 5, tension: 400, friction: 50, precision: 0.0001 }
    })
  },[props.tick])

  const [{ scale }, setScale] = useSpring(() => ({
    scale: 1.5
  }))

  const handleOnPointerOver = useCallback(() => {
    setHoverd(true)
    setScale({
      scale: 2,
      config: config.wobbly
    })
  }, [setScale])

  const handleOnPointerOut = useCallback(() => {
    setHoverd(false)
    setScale({
      scale: 1.5,
      config: config.wobbly
    })
  }, [setScale])

  return (
    <a.mesh {...props} ref={ref} scale={scale} rotation-x={rotation} onPointerOver={handleOnPointerOver} onPointerOut={handleOnPointerOut}>
      <boxBufferGeometry attach='geometry' />
      <meshPhongMaterial attach='material' color='hotpink' transparent />
    </a.mesh>
  )
}