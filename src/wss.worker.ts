//! To avoid isolatedModules error
export default class WssWorker extends Worker {
  constructor() {
    super("")
  }
}
const ws = new WebSocket(`wss://mainnet.infura.io/ws/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`)

ws.addEventListener("open", e => {
  console.log("Socket open")
  const msg = {
    id: 1,
    method: "eth_subscribe",
    params: ["newHeads"]
  }
  ws.send(JSON.stringify(msg))
})

ws.addEventListener("message", e => {
  // eslint-disable-next-line
  self.postMessage(e.data)
})