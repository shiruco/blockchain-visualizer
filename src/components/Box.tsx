import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { ReactThreeFiber, useThree, useFrame } from '@react-three/fiber'
import { Html } from "@react-three/drei"
import { BlockTransactionObject } from "web3-eth"
import * as THREE from 'three'
import { Group, InstancedMesh, Mesh, Vector3, BufferGeometry } from 'three'
import { a } from '@react-spring/three'
import { useSpring, config } from '@react-spring/core'
import { hash2Colors } from '../utils/hash2Colors'

type BoxProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh> & {
  block: BlockTransactionObject
  index: number
  tick?: number
  onHoverOver: () => void
  onHoverOut: () => void
}
type TxProps = {
  hash: string
}
type TxLabelProps = {
  hash: string,
  position: THREE.Vector3
}

let mousePosition = { x: 0, y: 0 }
let intersectedTx: any

export default function Box(props: BoxProps) {
  //console.log(props.block.miner)
  
  const {camera} = useThree()

  const [hoverd, setHoverd] = useState(false)
  const [intersected, setIntersected] = useState(false)
  const [txLabel, setTxLabel] = useState<TxLabelProps>({
    hash: "",
    position: new THREE.Vector3()
  })

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
    mousePosition = { x: x, y: y }
  }, [])

  const handleOnPointerOver = useCallback((e: PointerEvent) => {
    e.stopPropagation()
    //e.preventDefault()

    setHoverd(true)
    setPointRendering(true)
    setScale({
      scale: 2,
      config: config.wobbly
    })

    props.onHoverOver()

    window.addEventListener("mousemove", handleMouseMove)

  }, [setScale])

  const handleOnPointerOut = useCallback((e: PointerEvent) => {
    e.stopPropagation()

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

  const Tx = React.memo((props: TxProps) => {
    const SIZE = 1.5
    const x = SIZE * (Math.random() - 0.5)
    const y = SIZE * (Math.random() - 0.5)
    const z = SIZE * (Math.random() - 0.5)

    const m = new THREE.MeshLambertMaterial({ color: 0xffffff })

    const handleTxClick = useCallback(() => {
      window.location.href = `https://etherscan.io/tx/${props.hash}`
    }, [])

    return (
      <mesh name={props.hash} position={[x, y, z]} args={[txGeom, m]} onClick={handleTxClick}/>
    )
  })

  const TxPoints = useMemo(() => {
    if (!pointRendering) return
    return (
      <group ref={refTxPoints} position={props.position} visible={hoverd}>
        {hoverd && props.block.transactions.map((tx, i) => <Tx key={i} hash={tx.hash} />)}
      </group>
    )
  },[hoverd, pointRendering])

  useFrame(() => {
    // raycast
    if (refTxPoints.current && Object.keys(refTxPoints.current).length) {

      if (hoverd) {
        raycaster.setFromCamera( mousePosition, camera )
        const intersects = raycaster.intersectObjects( refTxPoints.current.children, true )
        if (intersects.length > 0) {
          if (intersectedTx != intersects[0].object) {
            if (intersectedTx) {
              intersectedTx.material.color = new THREE.Color("#ffffff")
            }
            intersectedTx = intersects[0].object
            intersectedTx.material.color = new THREE.Color("#ff3b00")

            if (props.position) {
              const pos = props.position as number[]
              const targetPos = new THREE.Vector3(
                pos[0] + intersectedTx.position.x,
                intersectedTx.position.y - 0.3,
                0
              )
              setIntersected(true)
              setTxLabel({
                hash: intersectedTx.name,
                position: targetPos
              })
            }
          }
          
        } else {
          if (intersectedTx) {
            intersectedTx.material.color = new THREE.Color("#ffffff")
          }
          intersectedTx = null
          setIntersected(false)
          setTxLabel({
            hash: "",
            position: new THREE.Vector3(-9999, -9999, -9999)
          })
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

  const Label = useMemo(() => {
    const position = props.position as number[]
    const posX = position[0] != 0 ? position[0] : 0
    const x = posX - 0.8
    const y = position[1] + 1.6

    let blockHashJsx: JSX.Element[] | null = null
    const blockHashes = hash2Colors(props.block.hash)
    if (blockHashes && blockHashes.length) {
      blockHashJsx = [<span key={`blockhash`}>0x</span>]
      blockHashes.map((hex, i) => (
        blockHashJsx?.push(<span key={`blockhash-${i}`} className="hexColorBox" style={{backgroundColor: "#" + hex}}></span>)
      ))
    }

    let minerHashJsx: JSX.Element[] | null = null
    const minerHashes = hash2Colors(props.block.miner)
    if (minerHashes && minerHashes.length) {
      minerHashJsx = [<span key={`miberhash`}>0x</span>]
      minerHashes.map((hex, i) => (
        minerHashJsx?.push(<span key={`minerhash-${i}`} className="hexColorBox" style={{backgroundColor: "#" + hex}}></span>)
      ))
    }

    return (
      <mesh position={[x, y, 0]}>
        <Html style={{display: hoverd ? "none" : "block"}} distanceFactor={5}>
          <div className="block-content">
            <div className="number">{`#${props.block.number}`}</div>
            <div className="hexColor">
              <span className="label">blockHash</span>
              { blockHashJsx }
            </div>
            <div className="hexColor">
              <span className="label">miner</span>
              { minerHashJsx }
            </div>
            
          </div>
        </Html>
      </mesh>
    )
  }, [hoverd])

  const TxLabel = useMemo(() => {
    let txHashJsx: JSX.Element[] | null = null
    const txHashes = hash2Colors(txLabel.hash)
    if (txHashes && txHashes.length) {
      txHashJsx = [<span key={`miberhash`}>0x</span>]
      txHashes.map((hex, i) => (
        txHashJsx?.push(<span key={`txhash-${i}`} className="hexColorBox" style={{backgroundColor: "#" + hex}}></span>)
      ))
    }
    return (
      <mesh position={txLabel.position}>
        <Html style={{display: !intersected ? "none" : "block"}} distanceFactor={5}>
          <div className="tx-content">
            <div className="hexColor">
              <span className="label">TxHash</span>
              { txHashJsx }
            </div>
          </div>
        </Html>
      </mesh>
    )
  }, [intersected, txLabel])

  return (
    <group>
      {LineSecmentContents}
      {Contents}
      {TxPoints}
      {Line}
      {Label}
      {TxLabel}
    </group>
  )
}