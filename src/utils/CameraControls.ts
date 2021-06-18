import React, { useRef, useMemo, useEffect } from 'react'
import { extend, ReactThreeFiber, useThree, useFrame } from 'react-three-fiber'

export default function CameraControls() {

  const {
    camera,
    gl: { domElement }
  } = useThree()

  useFrame(({ clock }) => {
    console.log(camera)
  })
}