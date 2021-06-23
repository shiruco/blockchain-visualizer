import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree, Vector3 } from 'react-three-fiber'
import * as THREE from 'three'
import { Group, InstancedMesh, LineSegments, Mesh, Points } from 'three'
import { a, Transition } from '@react-spring/three'
import { SpringValue, useSpring, config } from '@react-spring/core'
import { useFrame } from 'react-three-fiber'
import { useHelper } from '@react-three/drei'
import throttle from 'lodash/throttle'
import { useMousePosition } from '../hooks/useMousePosition'

type BoxProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh> & {
  tick?: number
}

const matrix = new THREE.Matrix4()
const color = new THREE.Color(0xff0000)



export default function SampleBox(props: BoxProps) {

  const {scene, camera} = useThree()

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

  const verticles: any[] = []
  const particlesData: any[] = []
  const [pointRendering, setPointRendering] = useState(false)
  const refTxPoints = useRef({} as Group)

  const position = useMousePosition()

  const raycaster = useMemo(() => {
    return new THREE.Raycaster()
  }, [])

  const geom2 = useMemo(() => {
    return new THREE.BoxBufferGeometry(0.02, 0.02, 0.02)
  }, [])

  const mat = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      // 色
      color: 0xff0000,
    })
  }, [])

  

  const Tx = () => {
    const SIZE = 1.5
    const x = SIZE * (Math.random() - 0.5)
    const y = SIZE * (Math.random() - 0.5)
    const z = SIZE * (Math.random() - 0.5)

    const refX = useRef(x)
    const refY = useRef(y)
    const refZ = useRef(z)
    
    // tempObject.position.set(x, y, z)
    // tempObject.updateMatrix()

    // const usePrevious = (value: any) => {
    //   const ref = useRef(value)
    //   useEffect(() => {
    //       ref.current = value
    //   })
    //   return ref.current
    // }

    const ref = useRef({} as InstancedMesh)
    const [pos, setPos] = useState([x, y, z] as Vector3)
    useEffect(() => {
      console.log("tx use effect")
      // ref.current.setMatrixAt(0, matrix)
      // ref.current.setColorAt(0, color)
    }, [])

    // useFrame(() => {
    //   // let x = refX.current
    //   // if (x + 0.01 > 1 || x + 0.01 < -1) {
    //   //   x = x - 0.01
    //   // } else {
    //   //   x = x + 0.01
    //   // }

    //   // let y = refY.current
    //   // if (y + 0.01 > 1 || y + 0.01 < -1) {
    //   //   y -= 0.01
    //   // } else {
    //   //   y += 0.01
    //   // }

    //   // let z = refZ.current
    //   // if (z + 0.01 > 1 || z + 0.01 < -1) {
    //   //   z -= 0.01
    //   // } else {
    //   //   z += 0.01
    //   // }

    //   const x = refX.current += 0.01
    //   const y = refY.current += 0.01
    //   const z = refZ.current += 0.01
    //   console.log(x,y,z)
    //   setPos([x, y, z])
    // })

    console.log("tx render")
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff })

    return (
      <mesh ref={ref} position={pos} args={[geom2, m]}/>
    )
  }

  const TxPoints = useMemo(() => {
    if (!pointRendering) return
    
    console.log("TxPoints render")

    console.log(hoverd)
    return (
      <group ref={refTxPoints} position={props.position} visible={hoverd}>
        {hoverd && [...Array(300)].map((_, i) => <Tx key={i} />)}
      </group>
    )
  },[hoverd, pointRendering])

  const refLineSegments = useRef({} as LineSegments)

  useFrame(() => {
    if (!hoverd) {
      setPointRendering(false)
      return
    } else {
      setPointRendering(true)
    }
    //console.log("frame")

    if (refTxPoints.current && Object.keys(refTxPoints.current).length) {
      raycaster.setFromCamera( position, camera )
      const intersects = raycaster.intersectObjects( refTxPoints.current.children, true )
      if (intersects.length > 0) {
        const i: any = intersects[0].object
        const m: THREE.MeshLambertMaterial = i.material
        m.color = new THREE.Color(0xff0000)

        // const id: number = i.instanceId
        // const m = i.object as InstancedMesh
        // //console.log(i)
        // if (m.instanceColor) {  
        //   // m.setColorAt(id, color.setHex(Math.random() * 0xff0000))
        //   // m.instanceColor.needsUpdate = true
        //   console.log("!")
        // }
      }
    }
    
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