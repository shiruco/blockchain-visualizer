import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { LineSegments, Mesh, Object3D, Points } from 'three'
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
  }, [setScale])

  const handleOnPointerOut = useCallback(() => {
    setHoverd(false)
    setScale({
      scale: 1.5,
      config: config.wobbly
    })
  }, [setScale])

  const geom = useMemo(() => {
    const geom = new THREE.BoxBufferGeometry(1,1,1)
    return geom
  }, [])

  //const [verticles, setVerticles] = useState([] as any)
  //const [particlesData, setPerticlesData] = useState([] as any)
  const verticles: any[] = []
  const particlesData: any[] = []
  const refPoint = useRef({} as Points)

  const TxPoints = useMemo(() => {
    console.log("TxPoints")
    const SIZE = 1.5
    const LENGTH = 200
    
    if (particlesData.length === 0) {
      for (let i = 0; i < LENGTH; i++) {
        const x = SIZE * (Math.random() - 0.5)
        const y = SIZE * (Math.random() - 0.5)
        const z = SIZE * (Math.random() - 0.5)
      
        verticles.push(x, y, z)
        // setVerticles((old: any[]) => [...old, x, y, z])

        // setPerticlesData((old: any[]) => [...old, {
        //   velocity: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1 ),
        //   numConnections: 0
        // }])


  
        particlesData.push( {
          velocity: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1 ),
          numConnections: 0
        } )
      }
    }

    // 形状データを作成
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticles, 3).setUsage( THREE.DynamicDrawUsage ))
    
    // マテリアルを作成
    const material = new THREE.PointsMaterial({
      // 一つ一つのサイズ
      size: 0.02,
      // 色
      color: 0xffffff,
    })
    
    return (
      <points ref={refPoint} position={props.position} visible={hoverd} args={[geometry, material]} />
    )
  },[hoverd])

  const refLineSegments = useRef({} as LineSegments)

  useFrame(() => {
    let vertexpos = 0
    let colorpos = 0
    let numConnected = 0

    for ( let i = 0; i < 200; i ++ ) {

      // get the particle
      if(!particlesData[i]) continue
      const particleData = particlesData[ i ];

      verticles[ i * 3 ] += particleData.velocity.x;
      verticles[ i * 3 + 1 ] += particleData.velocity.y;
      verticles[ i * 3 + 2 ] += particleData.velocity.z;
    }
    //refLineSegments.current.geometry.attributes.position.needsUpdate = true
    //refPoint.current.geometry.attributes.position.needsUpdate = true
  })


  const LineSecmentContents = useMemo(() => {
    //console.log("render LineSecmentContents", geom)
    return (
      <a.lineSegments ref={refLineSegments} position={props.position} visible={hoverd} scale={scale} rotation-x={rotation}>
        <edgesGeometry attach='geometry' args={[geom]} />
        <lineBasicMaterial attach='material' color="#fff"/>
      </a.lineSegments>
    )
  }, [hoverd, scale])
  const Contents = useMemo(() => {
    //console.log("render Contents")
    return (
      <a.mesh {...props} visible={!hoverd} scale={scale} rotation-x={rotation} onPointerOver={handleOnPointerOver} onPointerOut={handleOnPointerOut}>
        <boxBufferGeometry attach='geometry' />
        <meshPhongMaterial attach='material' transparent />
      </a.mesh>
    )
  }, [hoverd, scale])

  return (
    <group>
      {LineSecmentContents}
      {TxPoints}
      {Contents}
    </group>
  )
}