import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { Mesh, Object3D } from 'three'
import { a, Transition } from '@react-spring/three'
import { SpringValue, useSpring, config } from '@react-spring/core'
import { useFrame } from 'react-three-fiber'
import { useHelper } from '@react-three/drei'
import throttle from 'lodash/throttle';

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

  const refMesh = useRef({} as Mesh)
  //useHelper(refMesh, BoxHelper, 'cyan')

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
    console.log("handleOnPointerOver")
    setHoverd(true)
    setScale({
      scale: 2,
      config: config.wobbly
    })
  }, [])

  const handleOnPointerOut = useCallback(() => {
    console.log("handleOnPointerOut")
    setHoverd(false)
    setScale({
      scale: 1.5,
      config: config.wobbly
    })
  }, [])

  const geom = useMemo(() => {
    const geom = new THREE.BoxBufferGeometry(1,1,1)
    return geom
  }, [])

  const handleRayCast = (raycaster: any, intersects: any) => {
    //console.log(intersects)
  }

  const LineSecmentContents = useMemo(() => {
    //console.log("render LineSecmentContents", geom)
    return (
      <a.lineSegments position={props.position} visible={hoverd} scale={scale} >
        <edgesGeometry attach='geometry' args={[geom]} />
        <lineBasicMaterial attach='material' color="#fff"/>
      </a.lineSegments>
    )
  }, [hoverd, scale])
  const Contents = useMemo(() => {
    //console.log("render Contents")
    return (
      <a.mesh {...props} visible={!hoverd} scale={scale} onPointerOver={handleOnPointerOver} onPointerOut={handleOnPointerOut}>
        <boxBufferGeometry attach='geometry' />
        <meshPhongMaterial attach='material' transparent />
      </a.mesh>
    )
  }, [hoverd, scale])

  return (
    <>
      {LineSecmentContents}
      {Contents}
    </>
  )
}