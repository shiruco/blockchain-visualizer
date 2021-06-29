
export function hash2Colors(hash: string) {
  const exceptPrefixHash = hash.substr(2)
  return splitByChunk(exceptPrefixHash, 6)
}

function splitByChunk(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)
  for (let i=0, x=0; i < numChunks; ++i, x += size) {
    chunks[i] = str.substr(x, size)
  }
  return chunks
}