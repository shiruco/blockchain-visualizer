module.exports = function override(config, env) {
  // web worker
  config.module.rules.push({
    test: /\.worker\.ts$/i,
    loader: "worker-loader",
  })
  return config
}