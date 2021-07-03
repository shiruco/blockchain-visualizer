//! To avoid isolatedModules error
export default class WssWorker extends Worker {
  constructor() {
    super("")
  }
}
const ws = new WebSocket("wss://mainnet.infura.io/ws/v3/96915aaef4e64bca88eeac18f8945aec")

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