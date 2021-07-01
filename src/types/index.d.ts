import { ReactThreeFiber } from 'react-three-fiber'
import { GlitchPass } from 'three/examples/jsm/controls/GlitchPass'
import { BloomPass } from 'three/examples/jsm/controls/BloomPass'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      readonly glitchPass: ReactThreeFiber.Object3DNode<GlitchPass, typeof GlitchPass>
      readonly bloomPass: ReactThreeFiber.Object3DNode<BloomPass, typeof BloomPass>
    }
  }
}