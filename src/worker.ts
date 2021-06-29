import Web3 from "web3"

export default function worker() {
  const web3 = new Web3()
  web3.setProvider(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/96915aaef4e64bca88eeac18f8945aec'))
  console.log("ok")
  web3.eth.subscribe('newBlockHeaders', (error, result) => {
    //console.log(error, result)
  })
  .on("connected", function(subscriptionId) {
    console.log(subscriptionId);
  })
  .on("data", function(blockHeader) {
    console.log(blockHeader)
  })
  .on("error", console.error)
}


// const ws = new WebSocket("wss://mainnet.infura.io/ws/v3/96915aaef4e64bca88eeac18f8945aec")

// ws.addEventListener("open", e => {
//   console.log("Socket Opne")
//   const msg = {
//     id: 1,
//     method: "eth_subscribe",
//     params: ["newHeads"]
//   }
//   ws.send(JSON.stringify(msg))
// })

// ws.addEventListener("message", e => {
//   console.log(e.data)
// })

// export { ws }