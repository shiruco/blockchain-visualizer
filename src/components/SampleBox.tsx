import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { Mesh, BoxHelper } from 'three'
import { a } from '@react-spring/three'
import { SpringValue, useSpring, config } from '@react-spring/core'
import { useFrame } from 'react-three-fiber'
import { useHelper } from '@react-three/drei'

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
    setHoverd(true)
    setScale({
      scale: 2,
      config: config.wobbly
    })
  }, [])

  const handleOnPointerOut = useCallback(() => {
    setHoverd(false)
    setScale({
      scale: 1.5,
      config: config.wobbly
    })
  }, [])

  const geom = useMemo(() => {
    return new THREE.BoxBufferGeometry()
  }, [])

  const LineSecmentContents = React.memo(props => {
    return (
      <a.mesh {...props} ref={refMesh} scale={scale} rotation-x={rotation} onPointerEnter={handleOnPointerOver} onPointerLeave={handleOnPointerOut}>
        <lineSegments>
          <edgesGeometry attach='geometry' args={[geom]}/>
          <lineBasicMaterial attach='material' transparent />
        </lineSegments>
      </a.mesh>
    )
  })
  const Contents = React.memo(props => {
    return (
      <a.mesh {...props} ref={refMesh} scale={scale} rotation-x={rotation} onPointerEnter={handleOnPointerOver} onPointerLeave={handleOnPointerOut}>
        <boxBufferGeometry attach='geometry' />
        <meshPhongMaterial attach='material' transparent />
      </a.mesh>
    )
  })

  return (
    <>
      {hoverd
        ? <LineSecmentContents {...props} />
        : <Contents {...props} />
      }
    </>
  )
}