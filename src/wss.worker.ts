//! To avoid isolatedModules error
export default class WssWorker extends Worker {
  constructor() {
    super("")
  }
}
const wssProvider = process.env.REACT_APP_WSS_PROVIDER
const ws = new WebSocket(wssProvider)

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