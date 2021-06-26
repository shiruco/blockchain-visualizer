import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Group, InstancedMesh, Mesh, Vector3, BufferGeometry } from 'three'
import { a } from '@react-spring/three'
import { useSpring, config } from '@react-spring/core'

type BoxProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh> & {
  index: number
  tick?: number
  onHoverOver: () => any
  onHoverOut: () => any
}

let position = { x: 0, y: 0 }

export default function Box(props: BoxProps) {
  
  const {camera} = useThree()

  const [hoverd, setHoverd] = useState(false)

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
  },[hoverd, setRotation, rotation, props.tick])

  const [{ scale }, setScale] = useSpring(() => ({
    scale: 1.5
  }))

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = ( e.clientX / window.innerWidth ) * 2 - 1
    const y = - ( e.clientY / window.innerHeight ) * 2 + 1
    position = { x: x, y: y }
  }, [])

  const handleOnPointerOver = useCallback(() => {
    setHoverd(true)
    setPointRendering(true)
    setScale({
      scale: 2,
      config: config.wobbly
    })

    props.onHoverOver()

    window.addEventListener("mousemove", handleMouseMove)

  }, [setScale])

  const handleOnPointerOut = useCallback(() => {
    setHoverd(false)
    setPointRendering(false)
    setScale({
      scale: 1.5,
      config: config.wobbly
    })

    props.onHoverOut()

    window.removeEventListener("mousemove", handleMouseMove)
  }, [setScale])

  const geom = useMemo(() => {
    const geom = new THREE.BoxBufferGeometry(1,1,1)
    return geom
  }, [])

  const [pointRendering, setPointRendering] = useState(false)
  const refTxPoints = useRef({} as Group)

  const raycaster = useMemo(() => {
    return new THREE.Raycaster()
  }, [])

  const txGeom = useMemo(() => {
    return new THREE.BoxBufferGeometry(0.02, 0.02, 0.02)
  }, [])

  const Tx = () => {
    const SIZE = 1.5
    const x = SIZE * (Math.random() - 0.5)
    const y = SIZE * (Math.random() - 0.5)
    const z = SIZE * (Math.random() - 0.5)

    const ref = useRef({} as InstancedMesh)
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff })

    return (
      <mesh ref={ref} position={[x, y, z]} args={[txGeom, m]}/>
    )
  }

  const TxPoints = useMemo(() => {
    if (!pointRendering) return
    return (
      <group ref={refTxPoints} position={props.position} visible={hoverd}>
        {hoverd && [...Array(300)].map((_, i) => <Tx key={i} />)}
      </group>
    )
  },[hoverd, pointRendering])

  useFrame(() => {
    // raycast
    if (refTxPoints.current && Object.keys(refTxPoints.current).length) {

      if (hoverd) {
        raycaster.setFromCamera( position, camera )
        const intersects = raycaster.intersectObjects( refTxPoints.current.children, true )
        if (intersects.length > 0) {
          const i: any = intersects[0].object
          const m: THREE.MeshLambertMaterial = i.material
          m.color = new THREE.Color(0xff0000)
        }
      }
    }
  })

  const LineSecmentContents = useMemo(() => {
    //console.log("render LineSecmentContents", geom)
    return (
      <a.lineSegments position={props.position} visible={hoverd} scale={scale} rotation-x={rotation}>
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
        <meshStandardMaterial attach='material' color="#ccc" roughness={0.4} />
      </a.mesh>
    )
  }, [hoverd, scale])

  
  const refLine = useRef({} as BufferGeometry)
  useEffect(() => {
    const points = []
    if (props.position) {
      const pos = props.position as number[]
      const x = pos[0]
      points.push(new Vector3(x - 1.5, 0, 0))
      points.push(new Vector3(x - 3.5 , 0, 0))
      refLine.current.setFromPoints(points)
    }
  },[])
  
  const Line = useMemo(() => {
    
    return (
      <lineSegments>
        <bufferGeometry ref={refLine} attach="geometry" />
        <lineBasicMaterial attach="material" color={'#ffffff'} linewidth={10} linecap={'round'} linejoin={'round'} />
      </lineSegments>
    )
  }, [scale])

  return (
    <group>
      {LineSecmentContents}
      {Contents}
      {TxPoints}
      {Line}
    </group>
  )
}