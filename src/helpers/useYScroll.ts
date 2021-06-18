import { useCallback, useEffect, useState } from 'react'
import { useSpring, config } from '@react-spring/core'
import { useGesture } from 'react-use-gesture'
import clamp from 'lodash/clamp'

export default function useYScroll(bounds: [number, number], props: any) {
  const [delta, setDelta] = useState(0)
  const [{ y }, set] = useSpring(() => ({ to: { y: 0 } , config: config.stiff }))
  const fn = useCallback(
    ({ xy: [, cy], previous: [, py], memo = y.get(), delta: [,d] }) => {
      const newY = clamp(memo + cy - py, ...bounds) 
      set({ y: newY })
      setDelta(d)
      return newY
    },
    [bounds, y, set]
  )
  const bind = useGesture({ onWheel: fn }, props)
  return [y, delta, bind]
}