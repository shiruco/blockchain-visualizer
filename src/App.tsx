import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'
import { SpringValue, useSpring, animated, config } from 'react-spring'
import { Effects } from '@react-three/drei'
import useInterval from 'use-interval'
import Web3 from "web3"
import { BlockTransactionObject } from "web3-eth"
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import Box from './components/Box'
import Swarm from './components/Swarm'
import useYScroll from './helpers/useYScroll'
import WssWorker from './wss.worker'
import './App.css'

const BLOCK_NUM = 20

extend({ GlitchPass })

export default function App() {

  const [blocks, setBlocks] = useState<BlockTransactionObject[]>([])

  // glitch
  const [glitchEnabled, setGlitchEnabled] = useState(false)

  useEffect(() => {
    const web3 = new Web3()
    web3.setProvider(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/96915aaef4e64bca88eeac18f8945aec'))

    const func = async () => {
      const worker = new WssWorker()
      worker.addEventListener('message', async (message) => {
        const obj = JSON.parse(message.data)
        if (obj.params) {
          const newBlockNumber = parseInt(obj.params.result.number, 16)
          const block = await web3.eth.getBlock(newBlockNumber, true)
          if (!block) return

          setBlocks((arr) => {
            // check latest block number
            setGlitchEnabled(true)
            //console.log(arr)
            if (arr.length > 0 && arr[0].number !== newBlockNumber) {
              return [block, ...arr]
            }
            return [...arr]
          })

        }
      })
      const latestBlockNumber = await (await web3.eth.getBlock('latest')).number
      setBlocks(await Promise.all([...Array(BLOCK_NUM)].map((_, i) => web3.eth.getBlock(latestBlockNumber - i, true))))
    }

    func()
  }, [])

  // disable glitch effect component
  setTimeout(() => {
    setGlitchEnabled(false)
  }, 5000)
  
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

  if (blocks.length <= 0) {
    return (
      <>
        loading...
      </>
    )
  }

  return (
    <animated.div style={bgStyle}>
      <Canvas camera={{position: [0,0,5], fov: 60}} >
        <Effects>
          <glitchPass enabled={glitchEnabled} attachArray="passes" />
        </Effects>
        <CameraPosition />
        <ambientLight />
        <pointLight distance={240} intensity={1} position={[0, -30, 10]} color="#ccc" />
        <Suspense fallback={null}>
          <a.group position-x={posX} position-y={-0.2}>
            { blocks.slice(0, BLOCK_NUM).map((block, i) => {
              return (
                <Box block={block} key={i} index={i} position={[-5 * i, 0, 0]} tick={tick} onHoverOver={onHoverOverBox} onHoverOut={onHoverOutBox}/>
              )
            }) }
          </a.group>
        </Suspense>
        <Swarm count={1000} />
        {/* <Stats /> */}
      </Canvas>
      <div className="title">
        <span>Ethereum blockchain visualization</span>
        <span className="version">(beta)</span>
        <div className="desc">
          You are viewing the latest 20 blocks.<br />
          Each transaction is stored in a block.
        </div>
      </div>
    </animated.div>
  )
}